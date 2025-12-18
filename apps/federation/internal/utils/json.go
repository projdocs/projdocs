package utils

import (
	"encoding/json"
	"io"
	"net/http"
)

type Problems map[string]string

type Validator interface {
	Validate() Problems
}

func DecodeJSON[T any](r *http.Request, dst *T) error {
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	if err := dec.Decode(dst); err != nil {
		return err
	}
	if err := dec.Decode(&struct{}{}); err != io.EOF {
		return &ErrInvalidJSON
	}
	return nil
}

func DecodeValidJSON[T any](w http.ResponseWriter, r *http.Request, dst *T) bool {
	if err := DecodeJSON(r, dst); err != nil {
		BadRequest(w, "invalid JSON body")
		return false
	}

	if v, ok := any(dst).(Validator); ok {
		if p := v.Validate(); len(p) > 0 {
			ValidationError(w, p)
			return false
		}
	}
	return true
}

func JSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func BadRequest(w http.ResponseWriter, msg string) {
	JSON(w, http.StatusBadRequest, map[string]string{
		"error": msg,
	})
}

func ValidationError(w http.ResponseWriter, p Problems) {
	JSON(w, http.StatusUnprocessableEntity, map[string]any{
		"error":    "validation failed",
		"problems": p,
	})
}

var ErrInvalidJSON = json.InvalidUnmarshalError{}
