package models

import "context"

type FileSystem interface {
	CreateFolder(ctx context.Context, parentID *string, name string, metadata map[string]string) (*string, error)
}
