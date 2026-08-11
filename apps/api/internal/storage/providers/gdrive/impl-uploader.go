package gdrive

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"

	"github.com/projdocs/projdocs/apps/api/internal/storage/models"
)

func (gd *Provider) CreateUpload(ctx context.Context, info models.Info) (id string, err error) {

	fileMeta := map[string]any{
		"name":    info.Filename,
		"parents": []string{info.ParentPathOrID},
	}
	metaBytes, err := json.Marshal(fileMeta)
	if err != nil {
		return "", fmt.Errorf("new upload: marshal file meta: %w", err)
	}

	if req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		"https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true",
		bytes.NewReader(metaBytes),
	); err != nil {
		return "", fmt.Errorf("new upload: create request: %w", err)
	} else {
		req.Header.Set("Content-Type", "application/json; charset=UTF-8")
		req.Header.Set("X-Upload-Content-Type", info.MimeType)
		req.Header.Set("X-Upload-Content-Length", strconv.FormatInt(int64(info.Size), 10))

		if res, err := gd.http.Do(req); err != nil {
			return "", fmt.Errorf("new upload: do request: %w", err)
		} else {
			defer res.Body.Close()

			if res.StatusCode != http.StatusOK {
				return "", fmt.Errorf("new upload: bad status: %s", res.Status)
			}

			location := res.Header.Get("Location")
			if location == "" {
				return "", fmt.Errorf("new upload: no Location header")
			}

			parsed, err := url.Parse(location)
			if err != nil {
				return "", fmt.Errorf("new upload: parse session uri: %w", err)
			}
			uploadID := parsed.Query().Get("upload_id")
			if uploadID == "" {
				return "", fmt.Errorf("new upload: no upload_id in session uri")
			}
			return uploadID, nil
		}
	}
}

func (gd *Provider) UploadPart(ctx context.Context, info models.Info, chunk *models.Chunk) error {
	//TODO implement me
	panic("implement me")
}

func (gd *Provider) CompleteUpload(ctx context.Context, info models.Info) (id string, checksum string, err error) {
	//TODO implement me
	panic("implement me")
}
