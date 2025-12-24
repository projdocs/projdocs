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
		host *string = utils.Pointer(server.DefaultHost)
		port *uint16 = utils.Pointer(server.DefaultPort)
	)

	cmd := &cobra.Command{
		Use:           "serve",
		Short:         "serve projdocs",
		Long:          `NewServer a ProjDocs instance and all of its required microservices`,
		SilenceUsage:  true,
		SilenceErrors: true,
		RunE: func(cmd *cobra.Command, args []string) error {

			var shutdownDocker docker.ShutdownFunc

			// create docker client
			dkr, err := client.New()
			if err != nil {
				return fmt.Errorf("could not initialize docker client: %w", err)
			}

			// ping docker
			ping, err := dkr.Ping(cmd.Context(), client.PingOptions{})
			if err != nil {
				return fmt.Errorf("could not ping docker client: %w", err)
			}
			logger.Global().Debugf("connected to: Docker v%s for %s (API v%s)", ping.BuilderVersion, ping.OSType, ping.APIVersion)

			// create web server
			var serveErr chan error
			var httpServer *server.Server
			if srv, err := server.NewServer(server.RunConfig{
				Host: host,
				Port: port,
			}); err != nil {
				return fmt.Errorf("unable to create new server: %w", err)
			} else {
				httpServer = srv
				go func() {
					serveErr = srv.Start()
				}()
			}

			// get supabase config
			home, _ := utils.GetHomeDir() // error is checked in persistent prerun

			// construct supabase services
			var containers []*docker.Container
			if sbCfg, err := config.NewSupabase(
				"12345", // TODO: load vault encryption key dynamically
				home,
			); err != nil {
				return fmt.Errorf("unable to create supabase config: %w", err)
			} else {
				if sb, err := supabase.All(sbCfg); err != nil {
					return fmt.Errorf("could not instantiate supabase containers: %w", err)
				} else {
					containers = append(containers, sb...)
				}
			}

			// start docker runtime
			shutdownDocker = docker.Run(cmd.Context(), dkr, containers)

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

			to := 30
			logger.Global().Infof("commencing serve shutdown sequence (%d-second timeout)", to)
			ctx, cancel := context.WithTimeout(context.Background(), time.Duration(to)*time.Second)
			defer cancel()

			// shutdown docker
			if shutdownDocker != nil {
				logger.Global().Debugf("shutting down docker")
				shutdownDocker(ctx)
				logger.Global().Debugf("shut down docker")
			} else {
				logger.Global().Debugf("skipping docker shutdown (docker not started)")
			}

			// shutdown http server last
			logger.Global().Debugf("attempting to stop http server")
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

	return cmd
}
