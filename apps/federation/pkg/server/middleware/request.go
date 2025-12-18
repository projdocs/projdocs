package middleware

import (
	"fmt"
	"github.com/train360-corp/projdocs/apps/federation/pkg/logger"
	"net/http"
	"time"
)

func RequestHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		rec := &statusRecorder{
			ResponseWriter: w,
		}

		next.ServeHTTP(rec, r)

		status := rec.status
		if status == 0 {
			status = http.StatusOK
		}

		rid, _ := r.Context().Value(RequestIDContextKey).(string)

		logger.Global().Info(
			fmt.Sprintf(
				"%d %s %s rid=%s dur=%s",
				status,
				r.Method,
				r.URL.Path,
				rid,
				time.Since(start),
			),
		)
	})
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(code int) {
	r.status = code
	r.ResponseWriter.WriteHeader(code)
}

func (r *statusRecorder) Write(p []byte) (int, error) {
	if r.status == 0 {
		// Status not set explicitly → default is 200
		r.status = http.StatusOK
	}
	n, err := r.ResponseWriter.Write(p)
	return n, err
}
