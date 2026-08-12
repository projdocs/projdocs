package handlers

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/projdocs/projdocs/apps/api/internal/database"
	"github.com/projdocs/projdocs/apps/api/internal/db"
	"github.com/projdocs/projdocs/apps/api/internal/router/middleware"
	"github.com/projdocs/projdocs/apps/api/internal/storage/providers"
	"github.com/projdocs/projdocs/apps/api/internal/types/response"
)

var CompleteUpload gin.HandlerFunc = func(c *gin.Context) {

	// get role
	role, ok := c.Get(middleware.AuthenticationJWTRoleGinContextKey)
	if !ok {
		response.Error(c, http.StatusForbidden, "invalid role")
		return
	}

	// get id
	id, ok := c.Get(middleware.AuthenticationJWTIDGinContextKey)
	if !ok {
		response.Error(c, http.StatusForbidden, "invalid user id")
		return
	}

	// get the folder
	folderID, err := uuid.Parse(c.Param("folder-id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, fmt.Sprintf("bad folder-id: %v", err))
		return
	}

	// get the file-id (optional)
	var fileID *uuid.UUID = nil
	if fileIDstr := c.Param("file-id"); fileIDstr != "" {
		if _fileID, err := uuid.Parse(fileIDstr); err != nil {
			response.Error(c, http.StatusBadRequest, fmt.Sprintf("bad file-id: %v", err))
			return
		} else {
			fileID = &_fileID
		}
	}

	// get the uploadID
	uploadID, err := uuid.Parse(c.Param("upload-id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, fmt.Sprintf("bad upload-id: %v", err))
		return
	}

	// locate cache
	cached := cache.Get(uploadID.String())
	if cached == nil {
		response.Error(c, http.StatusNotFound, "bad upload-id")
		return
	}
	uploadInfo := cached.UploadInfo()
	if uploadInfo == nil {
		response.Error(c, http.StatusNotFound, "bad upload-info")
	}

	// get provider
	storage, err := providers.GetProvider(cached.ProviderMeta())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to instantiate storage-provider")
		return
	}

	// get db connection
	var txn *sql.Tx
	if pg, err := db.Get(); err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to connect to database")
		return
	} else if _txn, err := pg.BeginTx(context.Background(), nil); err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to begin transaction")
		return
	} else {
		txn = _txn
	}
	defer txn.Rollback()

	// set RLS
	if err := db.SetUser(txn, role.(string), uuid.MustParse(id.(string))); err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to set user")
		return
	}

	// create the file
	if fileID == nil {
		fileID = new(uuid.New())
		if _, err := txn.Exec(
			`insert into public.files (id, folder_id, name) values ($1, $2, $3)`,
			fileID.String(),
			folderID,
			uploadInfo.Filename,
		); err != nil {
			response.Error(c, http.StatusInternalServerError, "failed to create file")
			return
		}
	}

	// create the version
	versionID := uuid.New()
	var fv database.PublicFilesVersionsSelect
	if err := txn.QueryRow(
		`INSERT INTO public.files_versions
       (id, files_id, storage_uploads_id, mime_type, size)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, files_id, storage_uploads_id, mime_type, size,
               number, created_at::text, modified_at::text, last_modified_by`,
		versionID.String(),
		fileID.String(),
		uploadID.String(),
		uploadInfo.MimeType,
		uploadInfo.Size,
	).Scan(
		&fv.Id,
		&fv.FilesId,
		&fv.StorageUploadsId,
		&fv.MimeType,
		&fv.Size,
		&fv.Number,
		&fv.CreatedAt,
		&fv.ModifiedAt,
		&fv.LastModifiedBy,
	); err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to create file-version")
		return
	}

	if err := db.SetUser(txn, "admin", uuid.Nil); err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to handle authentication (switch-user error)")
		return
	}

	// complete upload with storage-provider
	if storageProviderID, checksum, err := storage.CompleteUpload(c, *cached.UploadInfo()); err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to complete upload on backend storage-provider")
		return
	} else if _, err := txn.Exec(
		`INSERT INTO public.storage_uploads (id, storage_provider_id, file_version_id, provider_id, checksum) VALUES ($1, $2, $3, $4, row($5, $6)::public.checksum)`,
		uploadID.String(),
		cached.ProviderMeta().Id,
		versionID.String(),
		storageProviderID,
		checksum.Algorithm,
		checksum.Hash,
	); err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to create storage-upload record")
		return
	}

	// commit
	if err := txn.Commit(); err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to commit transaction")
		return
	}

	// done
	response.Data(c, http.StatusAccepted, fv)
	return
}
