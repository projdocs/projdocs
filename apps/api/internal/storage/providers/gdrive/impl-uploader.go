package gdrive

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"slices"
	"strconv"

	"github.com/projdocs/projdocs/apps/api/internal/database"
	"github.com/projdocs/projdocs/apps/api/internal/storage/models"
)

const BASE_URL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id,sha256Checksum"

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
		BASE_URL,
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
	c := bytes.NewReader(*chunk.Data)
	c.Len()
	if req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPut,
		fmt.Sprintf("%s&upload_id=%s", BASE_URL, info.ID),
		c,
	); err != nil {
		return fmt.Errorf("upload chunk: create request: %w", err)
	} else {
		req.Header.Set("Content-Length", strconv.FormatUint(chunk.End-chunk.Start+1, 10))
		req.Header.Set("Content-Range", chunk.Range)

		if res, err := gd.http.Do(req); err != nil {
			return fmt.Errorf("upload chunk: do request: %w", err)
		} else {
			defer res.Body.Close()
			if !slices.Contains([]int{
				http.StatusOK,
				http.StatusCreated,
				http.StatusPermanentRedirect,
			}, res.StatusCode) {
				return fmt.Errorf("new upload: bad status: %s", res.Status)
			}
			return nil
		}
	}
}

func (gd *Provider) CompleteUpload(ctx context.Context, info models.Info) (id string, checksum database.PublicChecksum, err error) {
	if req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPut,
		fmt.Sprintf("%s&upload_id=%s", BASE_URL, info.ID),
		nil,
	); err != nil {
		return "", database.PublicChecksum{}, fmt.Errorf("complete upload: create request: %w", err)
	} else {
		req.Header.Set("Content-Range", "*/*")

		if res, err := gd.http.Do(req); err != nil {
			return "", database.PublicChecksum{}, fmt.Errorf("complete chunk: do request: %w", err)
		} else {
			defer res.Body.Close()

			if !slices.Contains([]int{
				http.StatusOK,
				http.StatusCreated,
			}, res.StatusCode) {
				return "", database.PublicChecksum{}, fmt.Errorf("complete upload: bad status: %s", res.Status)
			}

			var file struct {
				Id             string `json:"id"`
				Sha256Checksum string `json:"sha256Checksum"`
			}
			if err := json.NewDecoder(res.Body).Decode(&file); err != nil {
				return "", database.PublicChecksum{}, fmt.Errorf("complete upload: bad response: %w", err)
			}
			return file.Id, database.PublicChecksum{
				Hash:      file.Sha256Checksum,
				Algorithm: "sha256",
			}, nil
		}
	}
}
