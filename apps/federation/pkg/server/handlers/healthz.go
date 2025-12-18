package handlers

import (
	"github.com/train360-corp/projdocs/apps/federation/internal/utils"
	"net/http"
	"time"
)

type HealthzResponse struct {
	Status string `json:"status"`
	Time   string `json:"time"`
}

var Healthz http.Handler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	utils.JSON(w, http.StatusOK, HealthzResponse{
		Status: "ok",
		Time:   time.Now().UTC().Format(time.RFC3339Nano),
	})
})
