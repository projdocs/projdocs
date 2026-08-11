package models

import "context"

type Downloader interface {
	Download(
		ctx context.Context,
		PathOrID string,
		start int64,
		end int64,
	) ([]byte, error)
}
