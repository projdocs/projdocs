package models

import (
	"context"

	"github.com/projdocs/projdocs/apps/api/internal/utils"
)

type Info struct {
	ID             string
	ParentPathOrID string
	Filename       string
	MimeType       string
	Size           uint64
	Meta           *utils.Meta
}

type Chunk struct {
	Start, End, Total uint64
	Data              *[]byte
	Sha256            string
}

type Uploader interface {
	CreateUpload(ctx context.Context, info Info) (id string, err error)
	UploadPart(ctx context.Context, info Info, chunk *Chunk) error
	CompleteUpload(ctx context.Context, info Info) (id string, checksum string, err error)
}
