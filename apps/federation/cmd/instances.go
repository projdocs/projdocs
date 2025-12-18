package cmd

import (
	"github.com/spf13/cobra"
	"github.com/train360-corp/projdocs/apps/federation/internal/utils"
)

func InstancesCmd() *cobra.Command {

	cmd := &cobra.Command{
		Use:   "instances",
		Short: "manage instances",
		Long:  `View, edit, and remove instances in the Federation server.`,
		Run:   utils.EmptyHelpCmd,
	}

	// add sub commands here
	cmd.AddCommand()

	return cmd
}
