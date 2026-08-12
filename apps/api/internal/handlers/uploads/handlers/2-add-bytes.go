package handlers

import (
	"bytes"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/projdocs/projdocs/apps/api/internal/storage/models"
	"github.com/projdocs/projdocs/apps/api/internal/storage/providers"
	"github.com/projdocs/projdocs/apps/api/internal/types/response"
)

var UploadBytes gin.HandlerFunc = func(c *gin.Context) {

	// parse headers
	var start, end, total uint64
	contentRange := c.GetHeader("Content-Range")
	_, err := fmt.Sscanf(contentRange, "bytes %d-%d/%d", &start, &end, &total)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "malformed Content-Range")
		return
	}
	if end < start || total == 0 || end >= total {
		response.Error(c, http.StatusBadRequest, "invalid Content-Range")
		return
	}

	eTag := c.GetHeader("ETag")
	if eTag == "" {
		response.Error(c, http.StatusBadRequest, "missing ETag")
		return
	}
	raw, err := base64.StdEncoding.DecodeString(eTag)
	if err != nil || len(raw) != 32 {
		response.Error(c, http.StatusBadRequest, "invalid or missing checksum header (ETag)")
		return
	}

	// get the folder
	uploadID, err := uuid.Parse(c.Param("upload-id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, fmt.Sprintf("bad upload-id: %v", err))
		return
	}

	// locate cache
	cached := cache.Get(uploadID.String())
	if cached == nil {
		response.Error(c, http.StatusNotFound, fmt.Sprintf("bad upload-id: %v", err))
		return
	}

	// get provider
	storage, err := providers.GetProvider(cached.ProviderMeta())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to instantiate storage-provider")
		return
	}

	// get bytes
	expected := int64(end - start + 1)
	data := make([]byte, expected)
	if c.Request.ContentLength != expected {
		response.Error(c, http.StatusBadRequest, "Content-Length disagrees with Content-Range")
		return
	} else if _, err := io.ReadFull(c.Request.Body, data); err != nil {
		if errors.Is(err, io.ErrUnexpectedEOF) || errors.Is(err, io.EOF) {
			response.Error(c, http.StatusBadRequest, "body shorter than declared Content-Range")
		} else {
			response.Error(c, http.StatusInternalServerError, "failed to read body")
		}
		return
	}

	// verify data
	sum := sha256.Sum256(data)
	if !bytes.Equal(sum[:], raw) {
		response.Error(c, http.StatusBadRequest, "chunk checksum mismatch")
		return
	}

	// get chunk
	chunk := models.Chunk{
		Start:  start,
		End:    end,
		Total:  total,
		Range:  contentRange,
		Data:   &data,
		Sha256: eTag,
	}

	// handle upload
	if err := storage.UploadPart(c, *cached.UploadInfo(), &chunk); err != nil {
		response.Error(c, http.StatusInternalServerError, "failed to upload part to backend storage-provider")
		return
	}

	// done
	response.Data(c, gin.H{"status": "ok"})
	return
}
