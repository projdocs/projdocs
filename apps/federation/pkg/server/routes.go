package server

import (
	"github.com/train360-corp/projdocs/apps/federation/pkg/server/handlers"
	"net/http"
)

func registerRoutes(mux *http.ServeMux) {
	mux.Handle("GET /healthz", handlers.Healthz)
	mux.Handle("POST /federate", handlers.CreateInstance)
}
