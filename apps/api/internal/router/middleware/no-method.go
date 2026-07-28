package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/projdocs/projdocs/apps/api/internal/types/response"
)

// NoMethod returns a 405 envelope (register via engine.NoMethod).
func NoMethod() gin.HandlerFunc {
	return func(c *gin.Context) {
		response.Error(c, http.StatusMethodNotAllowed, "method not allowed")
	}
}
