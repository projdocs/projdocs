package docker

import (
	"context"
	"errors"
	"fmt"
	"github.com/moby/moby/client"
	"github.com/projdocs/projdocs/apps/cli/internal/docker/network"
	"github.com/projdocs/projdocs/apps/cli/internal/logger"
	"github.com/projdocs/projdocs/apps/cli/internal/utils"
	"io"
	"math"
	"regexp"
	"strings"
	"time"
)

var (
	containerNameConflictRE = regexp.MustCompile(`^Error response from daemon: Conflict\. The container name "/[^"]+" is already in use by container "[a-f0-9]{64}"\. You have to remove \(or rename\) that container to be able to reuse that name\.$`)
	imageNotFoundRe         = regexp.MustCompile(`^Error response from daemon: No such image: `)
	networkNotFoundRe       = regexp.MustCompile(`^Error response from daemon: \{"message":"network [^"]+ not found"}$`)
	networkNotFoundRe2      = regexp.MustCompile(`^Error response from daemon: network [^"]+ not found$`)
)

func isNetworkNotFoundErr(err error) bool {
	if err == nil {
		return false
	}
	return networkNotFoundRe.MatchString(err.Error()) || networkNotFoundRe2.MatchString(err.Error())
}

func isNameConflictErr(err error) bool {
	if err == nil {
		return false
	}
	return containerNameConflictRE.MatchString(err.Error())
}

func isImageNotFoundErr(err error) bool {
	if err == nil {
		return false
	}
	return imageNotFoundRe.MatchString(err.Error())
}

func (this *Docker) createContainer(ctx context.Context, c *Container) error {

	if c.created != nil {
		return fmt.Errorf("container %s is already created", c.Name)
	}

	select {
	case <-ctx.Done():
		logger.Global().Debugf("aborting start on container %s (%s): parent-context done", c.Name, c.Image)
		return fmt.Errorf("skipped (context done: %w)", ctx.Err())
	default:
		logger.Global().Debugf("creating container %s (%s)", c.Name, c.Image)

		opts, err := c.GetContainerCreateOptions()
		if err != nil {
			return fmt.Errorf("unable to create container options: %w", err)
		}

		// ensure image exists
		if inspect, err := this.api.ImageInspect(ctx, c.Image); err != nil {
			if isImageNotFoundErr(err) {
				logger.Global().Warnf("docker image '%s' was not found locally, and will be pulled instead (this may take a while)", c.Image)
				if rc, err := this.api.ImagePull(ctx, c.Image, client.ImagePullOptions{}); err != nil {
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
		ctr, err := this.api.ContainerCreate(ctx, *opts)
		if err != nil {
			if isNameConflictErr(err) {
				logger.Global().Debugf("container name conflict (%v); attempting to manually resolve", c.Name)
				if _, e := this.api.ContainerRemove(ctx, c.Name, client.ContainerRemoveOptions{
					RemoveVolumes: true,
					Force:         true,
				}); e != nil {
					logger.Global().Debugf("error removing conflicting container %v: %v", c.Name, e)
					return fmt.Errorf("container name ('%v') conflicts and could not be removed: %v", c.Name, e)
				} else {
					logger.Global().Debugf("container name conflict (%v) resolved; attempting to recreate", c.Name)
					ctr, err = this.api.ContainerCreate(ctx, *opts)
					if err != nil {
						return fmt.Errorf("could not create container on second-try: %v", err)
					}
				}

			} else {
				return err
			}
		}
		c.created = &ctr
		return nil
	}
}

func (this *Docker) startContainer(ctx context.Context, c *Container) error {

	if c.started != nil {
		return fmt.Errorf("container %s already started", c.Name)
	}

	select {
	case <-ctx.Done():
		logger.Global().Debugf("aborting start on container %s (%s): parent-context done", c.Name, c.Image)
		return fmt.Errorf("skipped (context done: %w)", ctx.Err())
	default:
		logger.Global().Debugf("starting container %s (%s)", c.Name, c.Image)

		// write any embedded files
		if c.Embeds != nil && len(c.Embeds) > 0 {
			logger.Global().Debugf("creating %d embedded files for container %s (%v)", len(c.Embeds), c.Name, c.Image)
			for f, file := range c.Embeds {
				if _, err := this.copyToContainer(ctx, c, file); err != nil {
					e := fmt.Sprintf("failed to create file %d in container %s (%v): %v", f, c.Name, c.Image, err)
					logger.Global().Debugf(e)
					return errors.New(e)
				} else {
					logger.Global().Debugf("created file %d in container %s (%v)", f, c.Name, c.Image)
				}
			}
		}

		logger.Global().Debugf("attempting to start container %s (%v)", c.Name, c.Image)
		if started, err := this.api.ContainerStart(ctx, c.Name, client.ContainerStartOptions{}); err != nil {
			return err
		} else {
			c.started = &started
		}
		return nil
	}

}

func (this *Docker) Stop(ctx context.Context, containers []*Container) (errors []error) {

	// obtain lock
	this.lock.Lock()
	defer this.lock.Unlock()

	logger.Global().Debugf("docker shutting down %d containers", len(containers))
	for i, c := range containers {

		// only stop if started
		if c.started == nil {
			logger.Global().Debugf("skipping stop of container %d (%v): was not started", i, c.Name)
		} else {
			logger.Global().Debugf("stopping container %d (%v)", i, c.Name)
			if _, err := this.api.ContainerStop(ctx, c.Name, client.ContainerStopOptions{}); err != nil {
				e := fmt.Errorf("error stopping container %d (%v): %v", i, c.Name, err)
				logger.Global().Error(e)
				errors = append(errors, e)
			} else {
				logger.Global().Debugf("stopped container %d (%v)", i, c.Name)
			}
		}

		// only remove if created
		if c.created == nil {
			logger.Global().Debugf("skipping removal of container %d (%v): was not created", i, c.Name)
		} else {
			logger.Global().Debugf("attempting to remove container %d (%v)", i, c.Name)
			if _, err := this.api.ContainerRemove(ctx, c.Name, client.ContainerRemoveOptions{
				RemoveVolumes: true,
				Force:         true,
			}); err != nil {
				e := fmt.Errorf("error removing container %d (%v): %v", i, c.Name, err)
				logger.Global().Error(e)
				errors = append(errors, e)
			} else {
				logger.Global().Debugf("removed container %d (%v)", i, c.Name)
			}
		}
	}
	return
}

// Run runs a list of containers using a given context
func (this *Docker) Run(_ctx context.Context, containers []*Container) (context.Context, context.CancelCauseFunc) {

	// obtain lock
	this.lock.Lock()
	defer this.lock.Unlock()

	ctx, cancel := context.WithCancelCause(_ctx)
	var completedWithoutInterruption bool = true

	// handle the network
	networkInspect, err := this.api.NetworkInspect(ctx, network.Name, client.NetworkInspectOptions{Verbose: true})
	if err != nil {
		if isNetworkNotFoundErr(err) {
			networkCreate, err := this.api.NetworkCreate(ctx, network.Name, client.NetworkCreateOptions{
				Driver:     "bridge",
				Scope:      "local",
				EnableIPv4: utils.Pointer(true),
				EnableIPv6: utils.Pointer(true),
				Internal:   false, // true = no external connectivity (usually keep false)
				Attachable: true,  // allow standalone containers to attach/detach
			})
			if err != nil {
				logger.Global().Errorf("error creating network: %v", err)
				cancel(errors.New("network creation failed"))
				return ctx, cancel
			} else {
				logger.Global().Debugf("created network: %s", networkCreate.ID)
			}
		} else {
			logger.Global().Errorf("error inspecting network: %v", err)
			cancel(errors.New("could not inspect network"))
			return ctx, cancel
		}
	} else {
		logger.Global().Debugf("found network: %s", networkInspect.Network.ID)
	}

	// process each container
	for i, container := range containers {
		select {
		case <-ctx.Done():
			logger.Global().Debugf("docker-run deteched parent context done (cancelling)")
			completedWithoutInterruption = false
			cancel(errors.New("parent context done"))
			break
		default:
			logger.Global().Debugf("building docker container %d (%s)", i, container.Name)

			// create the container
			if err := this.createContainer(ctx, container); err != nil {
				e := fmt.Errorf("could not create container %d (%v): %v", i, container.Name, err)
				logger.Global().Errorf("%v", e)
				cancel(e)
				continue
			} else {
				logger.Global().Debugf("created container %d (%v): %v", i, container.Name, container.GetID())
			}

			// start the container
			if err := this.startContainer(ctx, container); err != nil {
				e := fmt.Errorf("could not start container %d (%v): %v", i, container.Name, err)
				logger.Global().Errorf("%v", e)
				cancel(e)
				continue
			} else {
				logger.Global().Debugf("started container %d (%v)", i, container.Name)
			}

			// handle health check
			if container.HealthCheck != nil {
				healthy := false
				var err error
				for retries := 0; retries < 5; retries++ {
					if inspect, inspectErr := this.api.ContainerInspect(ctx, container.GetID(), client.ContainerInspectOptions{}); inspectErr != nil {
						err = fmt.Errorf("could not inspect container %d (%v): %v", i, container.Name, inspectErr)
						break
					} else {

						if inspect.Container.State.Health.Status == "healthy" {
							logger.Global().Debugf("container %d (%v) is healthy", i, container.Name)
							healthy = true
							break
						} else if inspect.Container.State.Health.Status == "unhealthy" {
							err = fmt.Errorf("container %d (%v) immediately stopped", i, container.Name)
							break
						} else {
							logger.Global().Debugf("container %s (%s) is not healthy (status=%s;retry=%d)", container.Name, container.Image, inspect.Container.State.Health.Status, retries)
						}
					}
					time.Sleep(time.Duration(math.Pow(2, float64(retries))) * time.Second)
				}
				if err != nil {
					logger.Global().Error(err)
					cancel(err)
					continue
				} else if !healthy {
					err = fmt.Errorf("container %d (%v) is not healthy", i, container.Name)
					logger.Global().Error(err)
					cancel(err)
					continue
				}
			}

			// run post-start
			if container.AfterStart != nil {
				logger.Global().Debugf("running after-start hook on container %d (%s)", i, container.Name)
				if output, err := container.AfterStart(ctx, this, container); err != nil {
					e := fmt.Errorf("after-start hook on container %d (%v): %v", i, container.Name, err)
					logger.Global().Error(e)
					cancel(e)
					continue
				} else {
					logger.Global().Debugf("ran after-start hook on container %d (%v): %s", i, container.Name, strings.ReplaceAll(output, "\n", "\\n"))
				}
			}

		}
	}

	if completedWithoutInterruption {
		logger.Global().Debugf("ran %d containers", len(containers))
	} else {
		logger.Global().Warnf("container-run interrupted")
	}
	return ctx, cancel
}
