package utils

import (
	"github.com/spf13/cobra"
	"github.com/train360-corp/projdocs/apps/federation/pkg/logger"
)

func EmptyHelpCmd(cmd *cobra.Command, args []string) {
	err := cmd.Help()
	if err != nil {
		logger.Global().Error(err.Error())
	}
}
