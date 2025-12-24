package middleware

import (
	"errors"
	"fmt"
	"github.com/projdocs/projdocs/apps/cli/internal/logger"
	"github.com/projdocs/projdocs/apps/cli/internal/server/utils"
	"net/http"
	"runtime/debug"
)

func RecoveryHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if v := recover(); v != nil {
				logger.Global().Error(fmt.Sprintf("panic: %v", v))
				logger.Global().Debug(string(debug.Stack()))
				utils.RespondWithError(w, errors.New("internal server error"))
			}
		}()
		next.ServeHTTP(w, r)
	})
}
