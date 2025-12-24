package server

import (
	"github.com/projdocs/projdocs/apps/cli/internal/server/handlers"
	"net/http"
)

func registerRoutes(mux *http.ServeMux) {
	mux.Handle("GET /healthz", handlers.Healthz)
}
