package utils

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
)

const MaxBodyBytes int64 = 1 << 20 // 1MB

var (
	ErrBodyTooLarge      = errors.New("request body too large")
	ErrInvalidJSONSyntax = errors.New("invalid json syntax")
	ErrInvalidFieldType  = errors.New("invalid json field type")
	ErrUnknownField      = errors.New("unknown json field")
	ErrMultipleJSON      = errors.New("multiple json values not allowed")
	ErrEmptyBody         = errors.New("empty request body")
	ErrBadRequestBody    = errors.New("bad request body")
)

type DecodeError struct {
	Err   error
	Field string // for type errors / unknown field if you want it later
}

func (e *DecodeError) Error() string {
	if e.Field != "" {
		return e.Err.Error() + ": " + e.Field
	}
	return e.Err.Error()
}
func (e *DecodeError) Unwrap() error { return e.Err }

// DecodeJSON reads exactly one JSON value into dst, disallows unknown fields,
// and returns rich errors. It does NOT enforce size limits by itself.
func DecodeJSON[T any](r io.Reader, dst *T) error {
	dec := json.NewDecoder(r)
	dec.DisallowUnknownFields()

	// Decode first JSON value
	if err := dec.Decode(dst); err != nil {
		var syn *json.SyntaxError
		var typ *json.UnmarshalTypeError

		switch {
		case errors.Is(err, io.EOF):
			return &DecodeError{Err: ErrEmptyBody}

		case errors.As(err, &syn):
			return &DecodeError{Err: ErrInvalidJSONSyntax}

		case errors.As(err, &typ):
			// typ.Field may be empty in some cases (e.g. arrays); keep it anyway
			return &DecodeError{Err: ErrInvalidFieldType, Field: typ.Field}

		default:
			// This catches "unknown field" too, but stdlib doesn't expose a typed error.
			// You can optionally string-match `json: unknown field` if you want.
			if isUnknownField(err) {
				return &DecodeError{Err: ErrUnknownField}
			}
			return &DecodeError{Err: ErrBadRequestBody}
		}
	}

	// Ensure there is no trailing JSON (or garbage) after the first value.
	// This is the canonical stdlib pattern.
	if err := dec.Decode(&struct{}{}); err != io.EOF {
		return &DecodeError{Err: ErrMultipleJSON}
	}

	return nil
}

// Best-effort detection of unknown fields (stdlib doesn't export a sentinel).
func isUnknownField(err error) bool {
	// json: unknown field "foo"
	const prefix = "json: unknown field "
	return err != nil && len(err.Error()) >= len(prefix) && err.Error()[:len(prefix)] == prefix
}

// BindJSON enforces MaxBodyBytes, closes the body, decodes and returns an error.
// No writing here: keep it reusable at handler level.
func BindJSON[T any](w http.ResponseWriter, r *http.Request, dst *T) error {
	r.Body = http.MaxBytesReader(w, r.Body, MaxBodyBytes)
	defer r.Body.Close()

	if err := DecodeJSON(r.Body, dst); err != nil {
		// If body exceeded MaxBytesReader limit, Read/Decode returns this:
		if errors.Is(err, http.ErrBodyReadAfterClose) {
			// defensive; usually means something already closed the body
			return &DecodeError{Err: ErrBadRequestBody}
		}
		// When MaxBytesReader trips, you typically get *http.MaxBytesError
		var mbe *http.MaxBytesError
		if errors.As(err, &mbe) {
			return &DecodeError{Err: ErrBodyTooLarge}
		}
		return err
	}

	return nil
}

// If you DO want a one-liner that writes responses:
func MustBindJSON[T any](w http.ResponseWriter, r *http.Request, dst *T) bool {
	if err := BindJSON(w, r, dst); err != nil {
		RespondWithErrorStatus(w, http.StatusBadRequest, err)
		return false
	}
	return true
}
