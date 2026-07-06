package projdocs

import (
	"log"
	"runtime"
	"time"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

func (a *App) setupSystemTray() {
	// Create system tray
	systray := a.server.SystemTray.New()
	systray.SetTooltip("ProjDocs Desktop")

	// set icon
	if runtime.GOOS == "darwin" {
		systray.SetTemplateIcon(trayIcon)
	} else {
		systray.SetIcon(trayIcon)
	}

	systray.
		AttachWindow(a.window).
		WindowOffset(10).
		WindowDebounce(200 * time.Millisecond).
		OnClick(func() {
			if a.window.IsVisible() {
				a.window.Hide()
			} else {
				a.window.Show()
			}
		})

	// Set menu
	systray.SetMenu(a.getSystemTrayMenu())
}

func (a *App) getSystemTrayMenu() *application.Menu {
	menu := a.server.NewMenu()
	showProjDocsCheckbox := menu.AddCheckbox("Show ProjDocs", a.window.IsVisible()).OnClick(func(ctx *application.Context) {
		showWindow := ctx.ClickedMenuItem().Checked()
		if showWindow {
			a.window.Show()
		} else {
			a.window.Hide()
		}
	})
	a.window.OnWindowEvent(events.Common.WindowHide, func(event *application.WindowEvent) {
		showProjDocsCheckbox.SetChecked(false)
	})
	a.window.OnWindowEvent(events.Common.WindowShow, func(event *application.WindowEvent) {
		showProjDocsCheckbox.SetChecked(true)
	})

	menu.AddSeparator()
	menu.AddCheckbox("Start at Login", a.isAutoStartEnabled).OnClick(func(ctx *application.Context) {
		a.isAutoStartEnabled = ctx.ClickedMenuItem().Checked()
		if a.isAutoStartEnabled {
			if err := a.server.Autostart.Enable(); err != nil {
				log.Printf("Error enabling autostart: %v", err)
			}
		} else {
			if err := a.server.Autostart.Disable(); err != nil {
				log.Printf("Error disabling autostart: %v", err)
			}
		}
	})
	menu.AddSeparator()
	menu.Add("Quit").OnClick(func(ctx *application.Context) {
		a.server.Quit()
	})
	return menu
}
