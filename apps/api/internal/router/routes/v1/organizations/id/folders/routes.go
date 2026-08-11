package folders

import (
	"github.com/gin-gonic/gin"
	"github.com/projdocs/projdocs/apps/api/internal/handlers"
	"github.com/projdocs/projdocs/apps/api/internal/handlers/uploads"
	"github.com/projdocs/projdocs/apps/api/internal/router/routes/v1/organizations/id/folders/files"
)

func Register(r *gin.RouterGroup) {
	fid := r.Group("/:folder-id")

	{
		// create new folders in this folder
		fid.POST("/folders", handlers.CreateFolder)

		// create new files in this folder
		uploads.Handler(fid.Group("/upload"))

		// manage existing files
		files.Register(fid.Group("/files"))
	}
}
