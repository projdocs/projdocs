package v1

import (
	"github.com/gin-gonic/gin"
	"github.com/projdocs/projdocs/apps/api/internal/handlers"
	"github.com/projdocs/projdocs/apps/api/internal/router/routes/v1/auth"
	"github.com/projdocs/projdocs/apps/api/internal/router/routes/v1/organizations"
)

func Register(r *gin.RouterGroup) {
	r.GET("/ping", handlers.Ping)
	organizations.Register(r.Group("/organizations"))
	auth.Register(r.Group("/auth"))
}
