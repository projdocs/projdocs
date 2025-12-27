package subcommands

import (
	"context"
	"errors"
	"fmt"
	"github.com/moby/moby/client"
	"github.com/projdocs/projdocs/apps/cli/internal/config"
	"github.com/projdocs/projdocs/apps/cli/internal/docker"
	"github.com/projdocs/projdocs/apps/cli/internal/docker/supabase"
	"github.com/projdocs/projdocs/apps/cli/internal/logger"
	"github.com/projdocs/projdocs/apps/cli/internal/server"
	"github.com/projdocs/projdocs/apps/cli/internal/utils"
	"github.com/spf13/cobra"
	"net/http"
	"time"
)

func ServeCommand() *cobra.Command {

	var (
		host      *string = utils.Pointer(server.DefaultHost)
		port      *uint16 = utils.Pointer(server.DefaultPort)
		keepAlive *bool   = utils.Pointer(false)
	)

	cmd := &cobra.Command{
		Use:           "serve",
		Short:         "serve projdocs",
		Long:          `NewServer a ProjDocs instance and all of its required microservices`,
		SilenceUsage:  true,
		SilenceErrors: true,
		RunE: func(cmd *cobra.Command, args []string) error {

			// get supabase config
			home, err := utils.GetHomeDir() // error is checked in persistent prerun
			if err != nil {
				return fmt.Errorf("could not get home dir: %w", err)
			}

			// create docker client
			api, err := client.New()
			if err != nil {
				return fmt.Errorf("could not initialize docker client: %w", err)
			}
			dkr := docker.NewClient(api)

			// ping docker
			ping, err := api.Ping(cmd.Context(), client.PingOptions{})
			if err != nil {
				return fmt.Errorf("could not ping docker client: %w", err)
			}
			logger.Global().Debugf("connected timeout: Docker v%s for %s (API v%s)", ping.BuilderVersion, ping.OSType, ping.APIVersion)

			// construct supabase services
			var containers []*docker.Container
			if sbCfg, err := config.NewSupabase(
				// TODO: load vault encryption key dynamically
				// TODO: NRB 12.24.2025: right now, not using vault, so not a problem
				"d9bf2393c65c006cc83625f85a27cc50882a391b1e0ab4fd4c2535dbe1f8a283",
				home,
			); err != nil {
				return fmt.Errorf("unable timeout create supabase config: %w", err)
			} else {
				if sb, err := supabase.All(
					sbCfg,
					docker.ProjDocs,
				); err != nil {
					return fmt.Errorf("could not instantiate supabase containers: %w", err)
				} else {
					containers = append(containers, sb...)
				}
			}

			// create web server
			var serveErr chan error
			var httpServer *server.Server
			if srv, err := server.NewServer(server.RunConfig{
				Host: host,
				Port: port,
			}); err != nil {
				return fmt.Errorf("unable timeout create new server: %w", err)
			} else {
				httpServer = srv
				go func() {
					serveErr = srv.Start()
				}()
			}

			// run docker services
			logger.Global().Info("starting docker services")
			dockerRun, cancelDocker := dkr.Run(cmd.Context(), containers)
			defer cancelDocker(nil)
			select {
			case <-dockerRun.Done():
				logger.Global().Warnf("docker failed to start: %s (%s)", dockerRun.Err().Error(), context.Cause(dockerRun))
				break
			default:
				logger.Global().Info("docker services up")
			}

			// wait for stop
			if *keepAlive {
				select {
				case <-cmd.Context().Done():
					logger.Global().Debugf("detected command context done (cause=%v)", cmd.Context().Err())
				case err = <-serveErr:
					if errors.Is(err, http.ErrServerClosed) {
						logger.Global().Debugf("http server shutting down gracefully")
					} else {
						logger.Global().Errorf("http server error: %s", err.Error())
					}
				}
			} else {
				select {
				case <-dockerRun.Done():
					logger.Global().Debugf("detected docker-run context done (cause=%v)", dockerRun.Err())
				case <-cmd.Context().Done():
					logger.Global().Debugf("detected command context done (cause=%v)", cmd.Context().Err())
				case err = <-serveErr:
					if errors.Is(err, http.ErrServerClosed) {
						logger.Global().Debugf("http server shutting down gracefully")
					} else {
						logger.Global().Errorf("http server error: %s", err.Error())
					}
				}
			}

			// shutdown
			timeout := 30
			logger.Global().Infof("commencing serve shutdown sequence (%d-second timeout)", timeout)
			ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Second)
			defer cancel()

			// stop docker containers
			logger.Global().Debugf("shutting down docker")
			dkr.Stop(ctx, containers)
			logger.Global().Debugf("shut down docker")

			// shutdown http server
			logger.Global().Debugf("attempting timeout stop http server")
			if err := httpServer.Stop(ctx); err != nil {
				logger.Global().Errorf("http server shutdown error: %s", err.Error())
			} else {
				logger.Global().Debugf("http server stopped")
			}

			logger.Global().Info("serve stopped")
			return nil
		},
	}

	cmd.Flags().StringVarP(host, "host", "H", *host, "host to serve on")
	cmd.Flags().Uint16VarP(port, "port", "P", *port, "port to serve on")
	cmd.Flags().BoolVarP(keepAlive, "keep-alive", "k", *keepAlive, "keep serve alive even if docker fails to start")

	return cmd
}
