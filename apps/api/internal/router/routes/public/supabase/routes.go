package supabase

import (
	"github.com/gin-gonic/gin"
	"github.com/projdocs/projdocs/apps/api/internal/router/routes/public/supabase/proxy"
)

func Register(r *gin.RouterGroup) {
	proxy.Register(r.Group("/proxy"))
}
