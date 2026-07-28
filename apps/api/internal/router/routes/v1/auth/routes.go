package auth

import (
	"github.com/gin-gonic/gin"
	"github.com/projdocs/projdocs/apps/api/internal/router/routes/v1/auth/authorize"
)

func Register(r *gin.RouterGroup) {
	authorize.Register(r.Group("/authorize"))
}
