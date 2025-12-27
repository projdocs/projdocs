package cmd

import (
	"fmt"
	"github.com/projdocs/projdocs/apps/cli/cmd/subcommands"
	"github.com/projdocs/projdocs/apps/cli/internal/config"
	"github.com/projdocs/projdocs/apps/cli/internal/logger"
	"github.com/projdocs/projdocs/apps/cli/internal/utils"
	"github.com/spf13/cobra"
	"go.uber.org/zap/zapcore"
	"io"
	"os"
)

func RootCmd(writer io.Writer) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "projdocs",
		Short: "Manage a ProjDocs instance",
		RunE:  utils.HelpFuncRunE,
		PersistentPreRunE: func(cmd *cobra.Command, args []string) error {

			if *config.GetGlobal().Verbose {
				logger.SetLevel(zapcore.DebugLevel)
				logger.Global().Debug("verbose mode active")
			}

			if home, err := utils.GetHomeDir(); err != nil {
				return fmt.Errorf("could not get home dir: %w", err)
			} else {
				stat, statErr := os.Stat(home)
				if statErr != nil {
					if os.IsNotExist(statErr) {
						if err := os.Mkdir(home, 0755); err != nil {
							return fmt.Errorf("could not create home dir: %w", err)
						} else {
							stat, statErr = os.Stat(home)
						}
					} else {
						return fmt.Errorf("could not get home dir (%s): %w", home, statErr)
					}
				} else if !stat.IsDir() {
					return fmt.Errorf("home dir (%s) is not a directory", home)
				}
				logger.Global().Debugf("home dir: %s", home)
			}

			return nil
		},
	}
	cmd.SetOut(writer)
	cmd.SetErr(writer)

	cmd.PersistentFlags().BoolVarP(config.GetGlobal().Verbose, "verbose", "v", false, "verbose output")

	cmd.AddCommand(
		subcommands.ServeCommand(),
	)

	return cmd
}
