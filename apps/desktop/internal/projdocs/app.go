package projdocs

import (
	"embed"
	"log"
	"time"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
	"github.com/wailsapp/wails/v3/pkg/services/dock"
)

//go:embed iconTemplate.png
var trayIcon []byte

type App struct {
	server       *application.App
	_dockService *dock.DockService
	window       *application.WebviewWindow

	isAutoStartEnabled bool
}

func NewApp(assets embed.FS) *App {
	dockService := dock.New()

	app := &App{
		_dockService: dockService,
		server: application.New(application.Options{
			Name:        "ProjDocs",
			Description: "ProjDocs Desktop Client",
			Services:    []application.Service{
				//application.NewService(dockService),
			},
			Assets: application.AssetOptions{Handler: application.AssetFileServerFS(assets)},
			Mac: application.MacOptions{
				ApplicationShouldTerminateAfterLastWindowClosed: false,
				ActivationPolicy: application.ActivationPolicyAccessory,
			},
			SingleInstance: &application.SingleInstanceOptions{
				UniqueID: "com.projdocs.desktop",
				OnSecondInstanceLaunch: func(data application.SecondInstanceData) {
					log.Printf("Second instance launched with args: %v", data.Args)
					log.Printf("Working directory: %s", data.WorkingDir)
					log.Printf("Additional data: %v", data.AdditionalData)
					dockService.HideAppIcon()
				},
				AdditionalData: map[string]string{
					"launchtime": time.Now().String(),
				},
			},
		}),
	}

	if _isAutoStartEnabled, err := app.server.Autostart.IsEnabled(); err != nil {
		log.Printf("Error checking if autostart is enabled: %v", err)
		app.isAutoStartEnabled = false
	} else {
		app.isAutoStartEnabled = _isAutoStartEnabled
	}

	app.server.Event.OnApplicationEvent(events.Common.ApplicationStarted, func(event *application.ApplicationEvent) {
		dockService.HideAppIcon()
	})

	// setup components
	app.setupWindow()
	app.setupSystemTray()
	app.setupEventHandlers()

	return app
}

func (a *App) Run() error {
	return a.server.Run()
}
