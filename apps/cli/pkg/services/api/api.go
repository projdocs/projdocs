package api

import (
	"fmt"

	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/client"
	"github.com/projdocs/projdocs/apps/cli/internal/config"
	"github.com/projdocs/projdocs/apps/cli/internal/docker"
	"github.com/projdocs/projdocs/apps/cli/pkg"
	"github.com/projdocs/projdocs/apps/cli/pkg/services/postgres"
	"github.com/projdocs/projdocs/apps/cli/pkg/types"
)

var ServiceConstructor types.ServiceConstructor = func(cfg config.Config) *types.ServiceConstructorResult {
	return &types.ServiceConstructorResult{
		Container: &client.ContainerCreateOptions{
			Name:  "projdocs-api",
			Image: "ghcr.io/projdocs/api:v0.1.0",
			Config: &container.Config{
				Labels: map[string]string{
					"com.docker.compose.project": "projdocs",
					"com.projdocs.version":       pkg.Version,
				},
				Env: []string{
					fmt.Sprintf("PROJDOCS_SUPABASE_S3_ACCESS_KEY=%s", cfg.Supabase.Storage.S3AccessKeyID),
					fmt.Sprintf("PROJDOCS_SUPABASE_S3_SECRET_KEY=%s", cfg.Supabase.Storage.S3SecretKey),
					fmt.Sprintf("PROJDOCS_KONG_URL=http://kong:8000"),
					fmt.Sprintf("PROJDOCS_DATABASE_URL=postgres://postgres:%s@%s:5432/postgres", cfg.Supabase.Postgres.Password, postgres.ContainerName),
					fmt.Sprintf("PROJDOCS_JWT_KEYS=%s", cfg.Supabase.Keys.JWTKeys),
					fmt.Sprintf("PROJDOCS_SAFE_CONVERT_ACCESS_TOKEN=%s", cfg.SafeConvert.AccessToken),
					fmt.Sprintf("PROJDOCS_SAFE_CONVERT_URL=%s", "http://safe-convert:8080"),
				},
			},
			HostConfig: &container.HostConfig{
				RestartPolicy: container.RestartPolicy{Name: "unless-stopped"},
			},
			NetworkingConfig: docker.MakeNetworkConfig("api"),
		},
	}
}
