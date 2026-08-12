package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gabriel-vasile/mimetype"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/projdocs/projdocs/apps/api/internal/database"
	"github.com/projdocs/projdocs/apps/api/internal/db"
	"github.com/projdocs/projdocs/apps/api/internal/handlers"
	"github.com/projdocs/projdocs/apps/api/internal/storage/models"
	"github.com/projdocs/projdocs/apps/api/internal/storage/providers"
	"github.com/projdocs/projdocs/apps/api/internal/types/response"
	"github.com/projdocs/projdocs/apps/api/internal/utils"
)

// NewUpload handles a POST request to create a new multipart/resumable upload in a backend storage provider
// Request:
//
//	Body: ignored
//	Headers:
//	  X-File-Name: the name of the file
//	  X-File-Size: the size of the file
//	  X-File-Type: the mime type of the file
var NewUpload gin.HandlerFunc = func(c *gin.Context) {

	fileName := c.GetHeader("X-File-Name")
	if fileName == "" {
		response.Error(c, http.StatusBadRequest, "X-File-Name header is required, but missing")
		return
	}

	var fileSize uint64
	fileSizeStr := c.GetHeader("X-File-Size")
	if fileSizeStr == "" {
		response.Error(c, http.StatusBadRequest, "X-File-Size header is required, but missing")
		return
	} else if fileSize64, err := strconv.ParseUint(fileSizeStr, 10, 64); err != nil {
		response.Error(c, http.StatusBadRequest, "X-File-Size header is invalid")
		return
	} else {
		fileSize = fileSize64
	}

	fileType := c.GetHeader("X-File-Type")
	if fileType == "" {
		response.Error(c, http.StatusBadRequest, "X-File-Type header is required, but missing")
		return
	} else if mimetype.Lookup(fileType) == nil {
		response.Error(c, http.StatusBadRequest, "X-File-Type is not a valid MIME type")
		return
	}

	// get the folder
	folderID, err := uuid.Parse(c.Param("folder-id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, fmt.Sprintf("bad folder-id: %v", err))
		return
	}

	// get storage provider
	var storageMeta *database.PublicStorageProvidersSelect
	if resolved, ok := handlers.ResolveStorageProviderFromFolder(c, folderID); !ok {
		// error is handled in the resolver
		// response.Error(c, http.StatusInternalServerError, "failed to resolve storage provider")
		return
	} else {
		storageMeta = resolved
	}

	// instantiate StorageProvider
	storage, err := providers.GetProvider(storageMeta)
	if err != nil {
		log.Printf("error creating tus handler: %v", err)
		response.Error(c, http.StatusInternalServerError, "error creating upload handler")
		return
	}

	// get parent path containing this file
	var parentPathOrID string
	if err := db.MustGet().QueryRow(
		`select u.provider_id from public.storage_uploads u where u.id = (select f.storage_upload_id from public.folders f where f.id = $1)`,
		folderID,
	).Scan(&parentPathOrID); err != nil {
		response.Error(c, http.StatusInternalServerError, "unable to resolve parent-folder storage id")
		return
	}

	uploadID := uuid.New()
	info := models.Info{
		UploadID:       uploadID.String(),
		ID:             "", // does not exist yet
		ParentPathOrID: parentPathOrID,
		Filename:       fileName,
		MimeType:       fileType,
		Size:           fileSize,
		Meta:           utils.NewMeta(),
	}

	if id, err := storage.CreateUpload(c, info); err != nil {
		response.Error(c, http.StatusInternalServerError, "unable to create upload")
		return
	} else {
		// patch the id
		info.ID = id

		cached := cache.Set(uploadID, storageMeta, &info)

		// done
		c.Header("Expires", cached.ExpiresAt.UTC().Format(http.TimeFormat))
		c.Header("Location", uploadID.String())
		c.Status(http.StatusCreated)
		return
	}
}
