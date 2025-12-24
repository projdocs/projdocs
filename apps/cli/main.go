package main

import (
	"context"
	"github.com/fatih/color"
	"github.com/projdocs/projdocs/apps/cli/cmd"
	"github.com/projdocs/projdocs/apps/cli/internal/logger"
	"os"
	"os/signal"
	"syscall"
)

func main() {

	// basic
	output := os.Stdout
	rootCtx := context.Background()

	// setup contexts
	ctx, stop := signal.NotifyContext(rootCtx, os.Interrupt, syscall.SIGTERM)
	defer stop()

	// setup logger
	logger.DefaultWriter = output

	// run cobra
	if err := cmd.RootCmd(output).ExecuteContext(ctx); err != nil {
		if _, err := output.WriteString(color.RedString("%s\n", err.Error())); err != nil {
			panic(err)
		}
		os.Exit(1)
	}

	logger.Global().Debug("goodbye")
	os.Exit(0)
}
