package uploads

import (
	"github.com/gin-gonic/gin"
	"github.com/projdocs/projdocs/apps/api/internal/handlers/uploads/handlers"
)

func Handler(rg *gin.RouterGroup) {

	rg.POST("", handlers.NewUpload)
	rg.PATCH("/:upload-id", handlers.UploadBytes)
	rg.POST("/:upload-id/complete", handlers.CompleteUpload)
}
