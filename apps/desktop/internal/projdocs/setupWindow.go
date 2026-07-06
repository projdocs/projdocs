package projdocs

import (
	"github.com/wailsapp/wails/v3/pkg/application"
)

func (a *App) setupWindow() {
	a.window = a.server.Window.
		NewWithOptions(application.WebviewWindowOptions{
			Title: "ProjDocs Desktop",
			// Window sized to the golden ratio (1000 / 618 ≈ 1.618).
			Width:  1000,
			Height: 618,
			Mac: application.MacWindow{
				InvisibleTitleBarHeight: 50,
				Backdrop:                application.MacBackdropTranslucent,
				TitleBar:                application.MacTitleBarHiddenInset,
			},
			BackgroundColour: application.NewRGB(6, 7, 15),
			URL:              "/",
			AlwaysOnTop:      true,
			Hidden:           true,
		})
}
