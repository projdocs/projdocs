package handlers

import (
	"github.com/projdocs/projdocs/apps/cli/internal/server/utils"
	"github.com/projdocs/projdocs/apps/cli/pkg"
	"net/http"
	"time"
)

type HealthzResponse struct {
	Status  string `json:"status"`
	Time    string `json:"time"`
	Version string `json:"version"`
}

var Healthz http.Handler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	utils.Respond(
		w,
		HealthzResponse{
			Status:  "ok",
			Time:    time.Now().UTC().Format(time.RFC3339Nano),
			Version: pkg.Version,
		},
	)
})
