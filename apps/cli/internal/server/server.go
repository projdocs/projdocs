package server

import (
	"github.com/projdocs/projdocs/apps/cli/internal/server/middleware"
	"net/http"
)

func NewHandler() http.Handler {
	mux := http.NewServeMux()
	registerRoutes(mux)

	var handler http.Handler = mux

	// handlers run in reverse order
	// i.e., the last to be added is the first to run
	handler = middleware.JSONContentType(handler)
	handler = middleware.RequestHandler(handler)
	handler = middleware.RequestIDHandler(handler)
	handler = middleware.RecoveryHandler(handler)

	return handler
}
