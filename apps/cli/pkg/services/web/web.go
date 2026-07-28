package web

import (
	"fmt"

	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/client"
	"github.com/projdocs/projdocs/apps/cli/internal/config"
	"github.com/projdocs/projdocs/apps/cli/internal/docker"
	"github.com/projdocs/projdocs/apps/cli/pkg"
	"github.com/projdocs/projdocs/apps/cli/pkg/types"
)

var ServiceConstructor types.ServiceConstructor = func(cfg config.Config) *types.ServiceConstructorResult {
	return &types.ServiceConstructorResult{
		Container: &client.ContainerCreateOptions{
			Name:  "projdocs-web",
			Image: "ghcr.io/projdocs/projdocs:v0.0.8",
			Config: &container.Config{
				Labels: map[string]string{
					"com.docker.compose.project": "projdocs",
					"com.projdocs.version":       pkg.Version,
				},
				Env: []string{
					fmt.Sprintf("%s=%s",
						"PROJDOCS_API_URL",
						"http://api:8080",
					),
					fmt.Sprintf("%s=%s",
						"SUPABASE_KONG_URL",
						"http://kong:8000",
					),
					fmt.Sprintf("%s=%s",
						"SUPABASE_PUBLISHABLE_KEY",
						cfg.Supabase.Keys.Publishable,
					),
					fmt.Sprintf("%s=%s",
						"SUPABASE_SECRET_KEY",
						cfg.Supabase.Keys.Secret,
					),
				},
			},
			HostConfig: &container.HostConfig{
				RestartPolicy: container.RestartPolicy{Name: "unless-stopped"},
			},
			NetworkingConfig: docker.MakeNetworkConfig("web"),
		},
	}
}
