package projdocs

import (
	"net/url"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

func (a *App) setupEventHandlers() {

	a.server.Event.OnApplicationEvent(events.Common.ApplicationLaunchedWithUrl, func(e *application.ApplicationEvent) {
		e.Cancel()
		a.handleCustomURL(e.Context().URL())
	})

	a.server.Event.On(SetWindowVisibleEvent, func(event *application.CustomEvent) {
		visible := event.Data.(bool)
		if visible {
			a.window.Show()
		} else {
			a.window.Hide()
		}
	})

	a.window.RegisterHook(events.Common.WindowClosing, func(event *application.WindowEvent) {
		event.Cancel()
		a.window.Hide()
	})
	a.window.OnWindowEvent(events.Common.WindowShow, func(event *application.WindowEvent) {
		a.dockService.ShowAppIcon()
	})
	a.window.OnWindowEvent(events.Common.WindowHide, func(event *application.WindowEvent) {
		a.dockService.HideAppIcon()
	})
}

func (a *App) handleCustomURL(raw string) {
	u, err := url.Parse(raw)
	if err != nil {
		println(err.Error())
		return
	}

	a.server.Event.Emit(RedirectWindowEvent, u.String())

}
