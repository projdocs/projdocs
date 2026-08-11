package s3

import (
	"context"
	"fmt"
	"io"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func (p *Provider) Download(
	ctx context.Context,
	id string,
	start int64,
	end int64,
) ([]byte, error) {

	result, err := p.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(p.bucket),
		Key:    aws.String(id),
		Range:  aws.String(fmt.Sprintf("bytes=%d-%d", start, end)),
	})
	if err != nil {
		return nil, fmt.Errorf("s3 get object (%s): %w", id, err)
	}
	defer result.Body.Close()

	return io.ReadAll(result.Body)
}
