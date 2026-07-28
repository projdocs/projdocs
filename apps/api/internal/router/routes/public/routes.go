package public

import (
	"github.com/gin-gonic/gin"
	"github.com/projdocs/projdocs/apps/api/internal/router/routes/public/auth"
	"github.com/projdocs/projdocs/apps/api/internal/router/routes/public/supabase"
	"github.com/projdocs/projdocs/apps/api/internal/types/response"
)

func Register(r *gin.RouterGroup) {
	r.GET("/health", func(c *gin.Context) {
		response.Data(c, gin.H{"status": "ok"})
	})

	auth.Register(r.Group("/auth"))
	supabase.Register(r.Group("/supabase"))
}
