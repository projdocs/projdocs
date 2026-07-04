package main

import (
	"embed"

	"log"
	"time"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
	"github.com/wailsapp/wails/v3/pkg/services/dock"
)

// Wails uses Go's `embed` package to embed the frontend files into the binary.
// Any files in the frontend/dist folder will be embedded into the binary and
// made available to the frontend.
// See https://pkg.go.dev/embed for more information.

//go:embed all:frontend/dist
var assets embed.FS
var isAutoStartEnabled bool

func init() {
	// Register a custom event whose associated data type is string.
	// This is not required, but the binding generator will pick up registered events
	// and provide a strongly typed JS/TS API for them.
	application.RegisterEvent[string]("time")
}

// main function serves as the application's entry point. It initializes the application, creates a window,
// and starts a goroutine that emits a time-based event every second. It subsequently runs the application and
// logs any error that might occur.
func main() {

	dockService := dock.New()

	app := application.New(application.Options{
		Name:        "ProjDocs",
		Description: "ProjDocs Desktop Client",
		Services: []application.Service{
			application.NewService(&GreetService{}),
			application.NewService(dockService),
		},
		Assets: application.AssetOptions{Handler: application.AssetFileServerFS(assets)},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: false,
		},
	})

	if _isAutoStartEnabled, err := app.Autostart.IsEnabled(); err != nil {
		log.Printf("Error checking if autostart is enabled: %v", err)
		isAutoStartEnabled = false
	} else {
		isAutoStartEnabled = _isAutoStartEnabled
	}

	app.Event.OnApplicationEvent(events.Common.ApplicationStarted, func(event *application.ApplicationEvent) {
		dockService.HideAppIcon()
	})

	window := app.Window.
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

	window.RegisterHook(events.Common.WindowClosing, func(event *application.WindowEvent) {
		event.Cancel()
		window.Hide()
	})

	// Create system tray
	systray := app.SystemTray.New()

	//systray.SetIcon(icon)
	systray.SetLabel("PD")
	systray.
		AttachWindow(window).
		WindowOffset(10).
		WindowDebounce(200 * time.Millisecond).
		OnClick(func() {
			if window.IsVisible() {
				window.Hide()
			} else {
				window.Show()
			}
		})

	// Set menu
	menu := app.NewMenu()
	menu.AddCheckbox("Start at Login", isAutoStartEnabled).OnClick(func(ctx *application.Context) {
		isAutoStartEnabled = ctx.ClickedMenuItem().Checked()
		if isAutoStartEnabled {
			if err := app.Autostart.Enable(); err != nil {
				log.Printf("Error enabling autostart: %v", err)
			}
		} else {
			if err := app.Autostart.Disable(); err != nil {
				log.Printf("Error disabling autostart: %v", err)
			}
		}
	})
	menu.AddSeparator()
	menu.Add("Quit").OnClick(func(ctx *application.Context) {
		app.Quit()
	})
	systray.SetMenu(menu)

	// Create a goroutine that emits an event containing the current time every second.
	// The frontend can listen to this event and update the UI accordingly.
	go func() {
		for {
			now := time.Now().Format(time.RFC1123)
			app.Event.Emit("time", now)
			time.Sleep(time.Second)
		}
	}()

	// Run the application. This blocks until the application has been exited.
	err := app.Run()

	// If an error occurred while running the application, log it and exit.
	if err != nil {
		log.Fatal(err)
	}
}
