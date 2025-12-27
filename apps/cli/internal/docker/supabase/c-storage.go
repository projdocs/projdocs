package supabase

import (
	"fmt"
	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/api/types/mount"
	"github.com/projdocs/projdocs/apps/cli/internal/config"
	"github.com/projdocs/projdocs/apps/cli/internal/docker"
	"github.com/projdocs/projdocs/apps/cli/internal/docker/supabase/postgres"
	"os"
	"time"
)

var Storage docker.SupabaseAbstractContainerConstructor = func(cfg *config.Supabase) docker.ContainerConstructor {
	return func() (*docker.Container, error) {

		if stat, err := os.Stat(cfg.Storage.DataDirectory); err != nil {
			if os.IsNotExist(err) {
				if err := os.MkdirAll(cfg.Storage.DataDirectory, 0755); err != nil {
					return nil, fmt.Errorf("could not create storage dir: %w", err)
				} else {
					stat, err = os.Stat(cfg.Storage.DataDirectory)
				}
			} else {
				return nil, fmt.Errorf("could not get storage dir (%s): %w", cfg.Storage.DataDirectory, err)
			}
		} else if !stat.IsDir() {
			return nil, fmt.Errorf("storage dir (%s) is not a directory", cfg.Storage.DataDirectory)
		}

		return &docker.Container{
			Name:  "projdocs-supabase-storage",
			Image: "ghcr.io/supabase/storage-api:v1.33.0",
			Mounts: []mount.Mount{
				{
					Type:   mount.TypeBind,
					Source: cfg.Storage.DataDirectory,
					Target: "/var/lib/storage",
				},
			},
			Env: []string{
				fmt.Sprintf("%s=%s", "ANON_KEY", cfg.Keys.PublicJwt),
				fmt.Sprintf("%s=%s", "SERVICE_KEY", cfg.Keys.PrivateJwt),
				fmt.Sprintf("%s=%s", "POSTGREST_URL", "http://rest:3000"),
				fmt.Sprintf("%s=%s", "PGRST_JWT_SECRET", cfg.Keys.JwtSecret),
				fmt.Sprintf("%s=%s", "DATABASE_URL", fmt.Sprintf("postgres://supabase_storage_admin:%s@%s:5432/postgres", cfg.Database.Password, postgres.ContainerName)),
				fmt.Sprintf("%s=%s", "REQUEST_ALLOW_X_FORWARDED_PATH", "true"),
				fmt.Sprintf("%s=%s", "FILE_SIZE_LIMIT", "52428800"),
				fmt.Sprintf("%s=%s", "STORAGE_BACKEND", "file"),
				fmt.Sprintf("%s=%s", "FILE_STORAGE_BACKEND_PATH", "/var/lib/storage"),
				fmt.Sprintf("%s=%s", "TENANT_ID", "stub"),
				fmt.Sprintf("%s=%s", "REGION", "stub"),
				fmt.Sprintf("%s=%s", "GLOBAL_S3_BUCKET", "stub"),
				fmt.Sprintf("%s=%s", "ENABLE_IMAGE_TRANSFORMATION", "true"),
				fmt.Sprintf("%s=%s", "IMGPROXY_URL", "http://imgproxy:5001"),
			},
			HealthCheck: &container.HealthConfig{
				Interval: 5 * time.Second,
				Timeout:  5 * time.Second,
				Retries:  3,
				Test: []string{
					"CMD",
					"wget",
					"--no-verbose",
					"--tries=1",
					"--spider",
					"http://127.0.0.1:5000/status",
				},
			},
		}, nil
	}
}
