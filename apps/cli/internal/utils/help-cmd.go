package utils

import "github.com/spf13/cobra"

var HelpFuncRunE = func(cmd *cobra.Command, args []string) error {
	return cmd.Help()
}
