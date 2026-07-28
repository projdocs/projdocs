package main

import (
	"embed"
	"log"

	"github.com/projdocs/projdocs/apps/desktop/internal/projdocs"
	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

func init() {
	application.RegisterEvent[bool](projdocs.SetWindowVisibleEvent)
	application.RegisterEvent[string](projdocs.RedirectWindowEvent)
}

func main() {
	app := projdocs.NewApp(assets)
	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
