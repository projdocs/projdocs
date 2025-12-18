package main

import (
	"fmt"
	"github.com/train360-corp/projdocs/apps/federation/cmd"
	"github.com/train360-corp/projdocs/apps/federation/pkg/logger"
	"os"
)

func main() {

	// initialize logger
	if err := logger.Init(logger.FormatConsole); err != nil {
		panic("failed to initialize logger")
	}

	// run root command
	if err := cmd.NewRootCommand().Execute(); err != nil {
		logger.Global().Fatal(fmt.Sprintf("failed to run root command: %s", err))
	}

	logger.Global().Debug("done")
	os.Exit(0)
}
