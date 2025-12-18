package cmd

import (
	"github.com/spf13/cobra"
	"github.com/train360-corp/projdocs/apps/federation/internal/utils"
	"github.com/train360-corp/projdocs/apps/federation/pkg/logger"
	"github.com/train360-corp/projdocs/apps/federation/pkg/server"
)

func ServeCmd() *cobra.Command {

	var (
		host *string = utils.Pointer(server.DefaultHost)
		port *uint16 = utils.Pointer(server.DefaultPort)
	)

	cmd := &cobra.Command{
		Use:   "serve",
		Short: "serve http server",
		Long:  `Start the ProjDocs Federation HTTP Server on a specified host and port`,
		Run: func(cmd *cobra.Command, args []string) {
			if err := server.Run(server.RunConfig{
				Host: host,
				Port: port,
			}); err != nil {
				logger.Global().Fatal(err.Error())
			}
		},
	}

	cmd.Flags().StringVarP(host, "host", "H", *host, "host to serve on")
	cmd.Flags().Uint16VarP(port, "port", "P", *port, "port to serve on")

	return cmd
}
