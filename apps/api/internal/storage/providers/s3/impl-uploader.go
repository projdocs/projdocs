package s3

import (
	"bytes"
	"context"
	"fmt"
	"maps"
	"slices"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/projdocs/projdocs/apps/api/internal/storage/models"
)

func getKey(info *models.Info) string {
	return fmt.Sprintf("%s/%s",
		strings.TrimPrefix(strings.TrimSuffix(info.ParentPathOrID, "/"), "/"),
		info.Filename,
	)
}

func (p *Provider) CreateUpload(ctx context.Context, info models.Info) (id string, err error) {
	if resp, err := p.client.CreateMultipartUpload(ctx, new(s3.CreateMultipartUploadInput{
		Bucket:      aws.String(p.bucket),
		Key:         aws.String(getKey(&info)),
		ContentType: aws.String(info.MimeType),
	})); err != nil {
		return "", fmt.Errorf("create upload: %w", err)
	} else if resp == nil || resp.UploadId == nil {
		return "", fmt.Errorf("create upload: nil upload id")
	} else {
		return *resp.UploadId, nil
	}
}

func (p *Provider) UploadPart(ctx context.Context, info models.Info, chunk *models.Chunk) error {
	part := int32(chunk.Start/chunk.Total) + 1
	if resp, err := p.client.UploadPart(ctx, &s3.UploadPartInput{
		Bucket:            aws.String(p.bucket),
		Key:               aws.String(getKey(&info)),
		UploadId:          aws.String(info.ID),
		PartNumber:        aws.Int32(part),
		ContentLength:     aws.Int64(int64(chunk.End - chunk.Start + 1)),
		Body:              bytes.NewReader(*chunk.Data),
		ChecksumAlgorithm: types.ChecksumAlgorithmSha256,
		ChecksumSHA256:    aws.String(chunk.Sha256),
	}); err != nil {
		return fmt.Errorf("upload part: %w", err)
	} else if resp.ETag == nil || *resp.ETag == "" {
		return fmt.Errorf("upload response: nil/empty etag")
	} else {
		info.Meta.Update(func(data map[string]any) {
			parts, ok := data["parts"].(map[int32]string)
			if !ok {
				parts = make(map[int32]string)
				data["parts"] = parts
			}
			parts[part] = *resp.ETag
		})
	}
	return nil
}

func (p *Provider) CompleteUpload(ctx context.Context, info models.Info) (id string, checksum string, err error) {

	raw, ok := info.Meta.Get("parts")
	if !ok {
		return "", "", fmt.Errorf("no parts recorded for upload %s", info.ID)
	}
	stored, ok := raw.(map[int32]string)
	if !ok {
		return "", "", fmt.Errorf("parts: unexpected type %T", raw)
	}
	parts := make([]types.CompletedPart, 0, len(stored))
	for _, n := range slices.Sorted(maps.Keys(stored)) {
		parts = append(parts, types.CompletedPart{
			PartNumber: aws.Int32(n),
			ETag:       aws.String(stored[n]),
		})
	}

	if res, err := p.client.CompleteMultipartUpload(ctx, &s3.CompleteMultipartUploadInput{
		Bucket:          aws.String(p.bucket),
		Key:             aws.String(getKey(&info)),
		UploadId:        aws.String(info.ID),
		MultipartUpload: &types.CompletedMultipartUpload{Parts: parts},
	}); err != nil {
		return "", "", fmt.Errorf("complete upload: %w", err)
	} else {
		return getKey(&info), strings.Trim(*res.ETag, "\""), nil
	}
}
