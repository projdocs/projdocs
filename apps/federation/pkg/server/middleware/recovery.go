package middleware

import (
	"fmt"
	"github.com/train360-corp/projdocs/apps/federation/pkg/logger"
	"net/http"
	"runtime/debug"
)

func RecoveryHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if v := recover(); v != nil {
				logger.Global().Error(fmt.Sprintf("panic: %v", v))
				logger.Global().Debug(string(debug.Stack()))
				http.Error(w, "internal server error", http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(w, r)
	})
}
