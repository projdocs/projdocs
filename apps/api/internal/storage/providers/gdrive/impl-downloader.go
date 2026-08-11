package gdrive

import (
	"context"
	"fmt"
	"io"
	"net/http"
)

func (gd *Provider) Download(ctx context.Context, id string, start int64, end int64) ([]byte, error) {
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		fmt.Sprintf("https://www.googleapis.com/drive/v3/files/%s?alt=media&supportsAllDrives=true", id),
		nil,
	)
	if err != nil {
		return nil, fmt.Errorf("drive get content: build request: %w", err)
	}
	req.Header.Set("Range", fmt.Sprintf("bytes=%d-%d", start, end))

	resp, err := gd.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("drive get content: do request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusPartialContent && resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("drive get content: status %d: %s", resp.StatusCode, body)
	}

	return io.ReadAll(resp.Body)
}
