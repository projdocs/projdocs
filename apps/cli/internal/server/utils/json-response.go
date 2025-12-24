package utils

import (
	"encoding/json"
	"github.com/projdocs/projdocs/apps/cli/internal/server/types"
	"net/http"
)

// Respond send a JSON representing types.DataResponse with a 200 status
func Respond[T any](w http.ResponseWriter, t T) {
	RespondWithStatus(w, http.StatusOK, t)
}

// RespondWithStatus send a JSON representing types.DataResponse with a custom status
func RespondWithStatus[T any](w http.ResponseWriter, status int, t T) {
	sendJSON(w, status, types.NewDataResponse(t))
}

// RespondWithError send a JSON representing types.ErrorResponse with a 500 status
func RespondWithError(w http.ResponseWriter, err error) {
	RespondWithErrorStatus(w, http.StatusInternalServerError, err)
}

// RespondWithErrorStatus send a JSON representing types.ErrorResponse with a custom status
func RespondWithErrorStatus(w http.ResponseWriter, status int, err error) {
	sendJSON(w, status, types.NewErrorResponse(err))
}

// sendJSON send a JSON response to a writer with a 200 status code
func sendJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
