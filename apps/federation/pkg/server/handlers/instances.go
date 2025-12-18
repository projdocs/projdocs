package handlers

import (
	"encoding/json"
	"errors"
	"github.com/train360-corp/projdocs/apps/federation/internal/utils"
	"net/http"
)

type CreateInstanceRequest struct {
}

type CreateInstanceResponse struct {
}

var CreateInstance http.Handler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

	// Limit body size (1MB here)
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	defer r.Body.Close()

	var req CreateInstanceRequest

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	if err := dec.Decode(&req); err != nil {
		var syntax *json.SyntaxError
		var unmarshal *json.UnmarshalTypeError

		switch {
		case errors.As(err, &syntax):
			http.Error(w, "invalid json syntax", http.StatusBadRequest)
		case errors.As(err, &unmarshal):
			http.Error(w, "invalid json field type", http.StatusBadRequest)
		case errors.Is(err, http.ErrBodyReadAfterClose):
			http.Error(w, "invalid request body", http.StatusBadRequest)
		default:
			http.Error(w, "bad request", http.StatusBadRequest)
		}
		return
	}

	// Ensure only ONE JSON object
	if dec.More() {
		http.Error(w, "multiple json objects not allowed", http.StatusBadRequest)
		return
	}

	utils.JSON(w, http.StatusOK, CreateInstanceResponse{})
})
