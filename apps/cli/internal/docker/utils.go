package docker

import (
	"archive/tar"
	"bytes"
	"context"
	"fmt"
	"github.com/moby/moby/client"
	"path"
	"strings"
	"time"
)

// copyToContainer copies a single file's contents into a docker container at file.Path.
// It creates any missing parent directories with mode 0755 and writes the file as 0644.
// Ownership will be the container default (usually root:root).
func copyToContainer(
	ctx context.Context,
	dkr *client.Client,
	cid string,
	file *EmbeddedFile,
) (*client.CopyToContainerResult, error) {
	if file.Path == "" || !strings.HasPrefix(file.Path, "/") {
		return nil, fmt.Errorf("container path must be absolute, got %q", file.Path)
	}

	// BuildE a tar that places the file at its absolute path by extracting under "/"
	rel := strings.TrimPrefix(file.Path, "/")
	if rel == "" || rel == "." || strings.Contains(rel, "..") {
		return nil, fmt.Errorf("invalid container path %q", file.Path)
	}
	parent := path.Dir(rel) // e.g. "etc/postgresql-custom"
	base := path.Base(rel)  // e.g. "postgresql.custom.conf"

	var buf bytes.Buffer
	tw := tar.NewWriter(&buf)
	now := time.Now()

	// Emit mkdir -p style directory headers (0755)
	if parent != "." && parent != "/" {
		parts := strings.Split(parent, "/")
		cur := ""
		for _, seg := range parts {
			if seg == "" {
				continue
			}
			if cur == "" {
				cur = seg
			} else {
				cur = cur + "/" + seg
			}
			hdr := &tar.Header{
				Name:     cur + "/", // relative dir entry
				Typeflag: tar.TypeDir,
				Mode:     0o755, // drwxr-xr-x
				ModTime:  now,
			}
			if err := tw.WriteHeader(hdr); err != nil {
				_ = tw.Close()
				return nil, fmt.Errorf("write dir header %q: %w", cur, err)
			}
		}
	}

	// File header at full relative path (parent/base) with 0644
	fhdr := &tar.Header{
		Name:     path.Join(parent, base),
		Typeflag: tar.TypeReg,
		Mode:     0o644, // -rw-r--r--
		Size:     int64(len(file.Data)),
		ModTime:  now,
	}
	if err := tw.WriteHeader(fhdr); err != nil {
		_ = tw.Close()
		return nil, fmt.Errorf("write file header %q: %w", file.Path, err)
	}
	if _, err := tw.Write(file.Data); err != nil {
		_ = tw.Close()
		return nil, fmt.Errorf("write file data %q: %w", file.Path, err)
	}
	if err := tw.Close(); err != nil {
		return nil, fmt.Errorf("close tar: %w", err)
	}

	// Extract under "/" so the tar's relative paths land at absolute locations
	cpy, cpyErr := dkr.CopyToContainer(ctx, cid, client.CopyToContainerOptions{
		DestinationPath:           "/",
		Content:                   bytes.NewReader(buf.Bytes()),
		AllowOverwriteDirWithFile: true,
		CopyUIDGID:                false, // do NOT preserve uid/gid from headers; use container defaults
	})
	return &cpy, cpyErr
}
