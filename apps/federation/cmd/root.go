package cmd

import (
	"fmt"
	"github.com/train360-corp/projdocs/apps/federation/internal/db"
	"github.com/train360-corp/projdocs/apps/federation/pkg/config"
	"github.com/train360-corp/projdocs/apps/federation/pkg/logger"
	"go.uber.org/zap/zapcore"
	"strings"

	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
)

func NewRootCommand() *cobra.Command {

	rootCmd := &cobra.Command{
		Use:   "federation",
		Short: "ProjDocs Federation",
		Long:  `Federation server for centralized control over a ProjDocs cluster.`,
		PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
			if err := initializeConfig(cmd); err != nil {
				return err
			}

			if *config.Global().Verbose {
				logger.SetLevel(zapcore.DebugLevel)
				logger.Global().Debug("verbose mode active")
			}

			// initialize db
			db.Init()

			return nil
		},
		Run: func(cmd *cobra.Command, args []string) {
			err := cmd.Help()
			if err != nil {
				logger.Global().Error(err.Error())
			}
		},
	}

	// define the global flags
	rootCmd.PersistentFlags().BoolVarP(config.Global().Verbose, "verbose", "v", false, "verbose output")

	rootCmd.AddCommand(
		ServeCmd(),
	)

	return rootCmd
}

func initializeConfig(cmd *cobra.Command) error {
	v := viper.New()

	v.SetConfigName("federation")
	v.AddConfigPath(".")
	if err := v.ReadInConfig(); err != nil {
		// It's okay if there isn't a config file
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return err
		}
	}

	v.SetEnvPrefix("FEDERATION_")
	v.SetEnvKeyReplacer(strings.NewReplacer("-", "_"))
	v.AutomaticEnv()
	cmd.Flags().VisitAll(func(f *pflag.Flag) {
		configName := f.Name
		configName = strings.ReplaceAll(f.Name, "-", "")
		if !f.Changed && v.IsSet(configName) { // Apply the viper config value to the flag when the flag is not set and viper has a value
			val := v.Get(configName)
			cmd.Flags().Set(f.Name, fmt.Sprintf("%v", val))
		}
	})

	return nil
}
