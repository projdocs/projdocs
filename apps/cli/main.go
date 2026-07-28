package main

import (
	"context"
	"fmt"
	"os"

	"github.com/fatih/color"
	"github.com/projdocs/projdocs/apps/cli/cmd"
	"github.com/projdocs/projdocs/apps/cli/internal/utils/terminal"
)

func main() {
	restore := terminal.SuppressInterruptEcho()
	defer restore()

	cli.ProjDocs.SilenceErrors = true
	cli.ProjDocs.SilenceUsage = true

	if err := cli.ProjDocs.ExecuteContext(context.Background()); err != nil {
		fmt.Fprintln(os.Stderr, color.RedString("Error: %s", err.Error()))
		os.Exit(1)
	}
	os.Exit(0)
}
