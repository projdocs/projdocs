package files

import (
	"github.com/gin-gonic/gin"
	"github.com/projdocs/projdocs/apps/api/internal/handlers/uploads"
	"github.com/projdocs/projdocs/apps/api/internal/router/routes/v1/organizations/id/folders/files/versions"
)

func Register(r *gin.RouterGroup) {
	fid := r.Group("/:file-id")

	// create new versions of this file
	uploads.Handler(fid.Group("/upload"))

	// manage existing versions
	versions.Register(fid.Group("/versions"))
}
