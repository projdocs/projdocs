package main

import (
	Events "changeme/internal/events"
	"embed"
	"runtime"

	"log"
	"time"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
	"github.com/wailsapp/wails/v3/pkg/services/dock"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/iconTemplate.png
var trayIcon []byte

var isAutoStartEnabled bool

func init() {
	application.RegisterEvent[bool](Events.ProjDocs.Window.SetVisible)
}

// main function serves as the application's entry point. It initializes the application, creates a window,
// and starts a goroutine that emits a time-based event every second. It subsequently runs the application and
// logs any error that might occur.
func main() {
	app := getApp()
	window := getWindow(app)
	setupSystemTray(app, window)

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}

func getApp() *application.App {
	dockService := dock.New()

	app := application.New(application.Options{
		Name:        "ProjDocs",
		Description: "ProjDocs Desktop Client",
		Services: []application.Service{
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

	return app
}

func getWindow(app *application.App) *application.WebviewWindow {
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

	app.Event.On(Events.ProjDocs.Window.SetVisible, func(event *application.CustomEvent) {
		visible := event.Data.(bool)
		if visible {
			window.Show()
		} else {
			window.Hide()
		}
	})

	return window
}

func setupSystemTray(
	app *application.App,
	window *application.WebviewWindow,
) {
	// Create system tray
	systray := app.SystemTray.New()

	if runtime.GOOS == "darwin" {
		systray.SetTemplateIcon(trayIcon)
	} else {
		systray.SetIcon(trayIcon)
	}

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
	systray.SetMenu(getSystemTrayMenu(app, window))
}

func getSystemTrayMenu(
	app *application.App,
	window *application.WebviewWindow,
) *application.Menu {
	menu := app.NewMenu()
	showProjDocsCheckbox := menu.AddCheckbox("Show ProjDocs", window.IsVisible()).OnClick(func(ctx *application.Context) {
		showWindow := ctx.ClickedMenuItem().Checked()
		if showWindow {
			window.Show()
		} else {
			window.Hide()
		}
	})
	window.OnWindowEvent(events.Common.WindowHide, func(event *application.WindowEvent) {
		showProjDocsCheckbox.SetChecked(false)
	})
	window.OnWindowEvent(events.Common.WindowShow, func(event *application.WindowEvent) {
		showProjDocsCheckbox.SetChecked(true)
	})

	menu.AddSeparator()
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
	return menu
}
