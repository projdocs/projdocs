package docker

import (
	"context"
	"errors"
	"fmt"
	"github.com/moby/moby/client"
	"github.com/projdocs/projdocs/apps/cli/internal/logger"
	"io"
	"regexp"
	"sync"
	"time"
)

var (
	runDocker               sync.Once
	shutdownDocker          sync.Once
	containerNameConflictRE = regexp.MustCompile(`^Error response from daemon: Conflict\. The container name "/[^"]+" is already in use by container "[a-f0-9]{64}"\. You have to remove \(or rename\) that container to be able to reuse that name\.$`)
	imageNotFoundRe         = regexp.MustCompile(`^Error response from daemon: No such image: `)
)

func createContainer(ctx context.Context, dkr *client.Client, c *Container) error {

	isNameConflictErr := func(err error) bool {
		if err == nil {
			return false
		}
		return containerNameConflictRE.MatchString(err.Error())
	}

	isImageNotFoundErr := func(err error) bool {
		if err == nil {
			return false
		}
		return imageNotFoundRe.MatchString(err.Error())
	}

	opts, err := c.GetContainerCreateOptions()
	if err != nil {
		return fmt.Errorf("unable to create container options: %w", err)
	}

	// ensure image exists
	if inspect, err := dkr.ImageInspect(ctx, c.Image); err != nil {
		if isImageNotFoundErr(err) {
			logger.Global().Warnf("docker image '%s' was not found locally, and will be pulled instead (this may take a while)", c.Image)
			if rc, err := dkr.ImagePull(ctx, c.Image, client.ImagePullOptions{}); err != nil {
				return fmt.Errorf("unable to pull image %s: %w", c.Image, err)
			} else {
				defer rc.Close()
				_, err = io.Copy(io.Discard, rc)
				if err != nil {
					return fmt.Errorf("unable to pull image %s: %w", c.Image, err)
				}
				logger.Global().Infof("pulled docker image '%s'", c.Image)
			}
		} else {
			return fmt.Errorf("unable to inspect image: %w", err)
		}
	} else {
		logger.Global().Debugf("found image %s: %s", c.Image, inspect.ID)
	}

	// create container
	ctr, err := dkr.ContainerCreate(ctx, *opts)
	if err != nil {
		if isNameConflictErr(err) {
			logger.Global().Debugf("container name conflict (%v); attempting to manually resolve", c.Name)
			if _, e := dkr.ContainerRemove(ctx, c.Name, client.ContainerRemoveOptions{
				RemoveVolumes: true,
				Force:         true,
			}); e != nil {
				logger.Global().Debugf("error removing conflicting container %v: %v", c.Name, e)
				return fmt.Errorf("container name ('%v') conflicts and could not be removed: %v", c.Name, e)
			} else {
				logger.Global().Debugf("container name conflict (%v) resolved; attempting to recreate", c.Name)
				ctr, err = dkr.ContainerCreate(ctx, *opts)
				if err != nil {
					return fmt.Errorf("could not create container (second-try): %v", err)
				}
			}

		} else {
			return fmt.Errorf("could not create container: %v", err)
		}
	}
	c.created = &ctr
	return nil
}

type ShutdownFunc func(ctx context.Context)

var StartUpInterruptError = errors.New("start-up interrupted by context cancellation")

func Run(ctx context.Context, dkr *client.Client, containers []*Container) (shutdown ShutdownFunc) {
	runDocker.Do(func() { // ensure run is only called once

		shutdown = func(ctx context.Context) {
			logger.Global().Debugf("commencing docker runtime shutdown sequence")
			shutdownDocker.Do(func() {
				logger.Global().Debugf("docker runtime shutting down")
				for i, c := range containers {

					if c.started == nil {
						logger.Global().Debugf("skipping stop of container %d (%v): was not started", i, c.Name)
					} else {
						logger.Global().Debugf("stopping container %d (%v)", i, c.Name)
						if _, err := dkr.ContainerStop(ctx, c.Name, client.ContainerStopOptions{}); err != nil {
							logger.Global().Errorf("error stopping container %d (%v): %v", i, c.Name, err)
						} else {
							logger.Global().Debugf("stopped container %d (%v)", i, c.Name)
						}
					}

					if c.created == nil {
						logger.Global().Debugf("skipping removal of container %d (%v): was not created", i, c.Name)
					} else {
						logger.Global().Debugf("attempting to remove container %d (%v)", i, c.Name)
						if _, err := dkr.ContainerRemove(ctx, c.Name, client.ContainerRemoveOptions{
							RemoveVolumes: true,
							Force:         true,
						}); err != nil {
							logger.Global().Errorf("error removing container %d (%v): %v", i, c.Name, err)
						} else {
							logger.Global().Debugf("removed container %d (%v)", i, c.Name)
						}
					}
				}

				logger.Global().Debugf("docker runtime shutdown successfully")
			})
		}

		err := func() error {
			logger.Global().Debugf("attempting to create %d containers", len(containers))
			for i, c := range containers {
				select {
				case <-ctx.Done():
					logger.Global().Debugf("aborting creation loop (context cancelled)")
					return StartUpInterruptError
				default:
					logger.Global().Debugf("attempting to create container %d (%v)", i, c.Image)
					if err := createContainer(ctx, dkr, c); err != nil {
						logger.Global().Errorf("could not create container %d (%v): %v", i, c.Image, err)
					}
					logger.Global().Debugf("created container %d (%v): %v", i, c.Image, c.created.ID)
				}
			}
			logger.Global().Debugf("created %d containers", len(containers))

			logger.Global().Debugf("attempting to start %d containers", len(containers))
			for i, c := range containers {
				select {
				case <-ctx.Done():
					logger.Global().Debugf("aborting start loop (context cancelled)")
					return StartUpInterruptError
				default:
					// write any embedded files
					if c.Embeds != nil && len(c.Embeds) > 0 {
						logger.Global().Debugf("creating %d embedded files for container %d (%v)", len(c.Embeds), i, c.Image)
						for f, file := range c.Embeds {
							if _, err := copyToContainer(
								ctx,
								dkr,
								c.created.ID,
								file,
							); err != nil {
								e := fmt.Sprintf("failed to create file %d in container %d (%v): %v", f, i, c.Image, err)
								logger.Global().Debugf(e)
								return errors.New(e)
							} else {
								logger.Global().Debugf("created file %d in container %d (%v)", f, i, c.Image)
							}
						}
					}

					logger.Global().Debugf("attempting to start container %d (%v)", i, c.Image)
					if started, err := dkr.ContainerStart(ctx, c.Name, client.ContainerStartOptions{}); err != nil {
						logger.Global().Errorf("could not start container %d (%v): %v", i, c.Image, err)
					} else {
						c.started = &started
					}
					logger.Global().Debugf("started container %d (%v): %v", i, c.Image, c.created.ID)
				}
			}
			logger.Global().Debugf("started %d containers", len(containers))
			return nil
		}()
		if err != nil {
			logger.Global().Errorf("could not start containers: %v", err)
			logger.Global().Warnf("docker run encountered an error during startup (automatically shutting down)")
			bg, cancel := context.WithTimeout(context.Background(), 30*time.Second)
			defer cancel()
			shutdown(bg)
			shutdown = nil
		}
	})
	return
}
