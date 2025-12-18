package middleware

import (
	"context"
	"github.com/google/uuid"
	"net/http"
)

const RequestIDContextKey string = "request_id"
const RequestIDHeaderKey string = "X-RequestHandler-Id"

func RequestIDHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rid := uuid.New()
		ctx := context.WithValue(r.Context(), RequestIDContextKey, rid.String())
		w.Header().Set(RequestIDHeaderKey, rid.String())
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
