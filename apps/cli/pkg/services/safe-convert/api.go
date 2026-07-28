package safe_convert

import (
	"fmt"

	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/api/types/network"
	"github.com/moby/moby/client"
	"github.com/projdocs/projdocs/apps/cli/internal/config"
	"github.com/projdocs/projdocs/apps/cli/internal/docker"
	"github.com/projdocs/projdocs/apps/cli/pkg"
	"github.com/projdocs/projdocs/apps/cli/pkg/types"
)

var ApiServiceConstructor types.ServiceConstructor = func(cfg config.Config) *types.ServiceConstructorResult {

	alias := "safe-convert"
	netCfg := make(map[string]*network.EndpointSettings, 2)

	// main network
	netCfg[docker.MainNetworkName] = &network.EndpointSettings{
		Aliases: []string{alias},
	}

	// private network
	netCfg[docker.SafeConvertNetworkName] = &network.EndpointSettings{
		Aliases: []string{alias},
	}

	return &types.ServiceConstructorResult{
		Container: &client.ContainerCreateOptions{
			Name:  "projdocs-safe-convert-api",
			Image: fmt.Sprintf("ghcr.io/projdocs/safe-convert-api:%s", Version),
			Config: &container.Config{
				Labels: map[string]string{
					"com.docker.compose.project": "projdocs",
					"com.projdocs.version":       pkg.Version,
				},
				Env: []string{
					fmt.Sprintf("SAFE_CONVERT_ACCESS_TOKEN=%s", cfg.SafeConvert.AccessToken),
					fmt.Sprintf("DOCKER_HOST=tcp://%s:2375", proxy),
				},
			},
			HostConfig: &container.HostConfig{
				RestartPolicy: container.RestartPolicy{Name: "unless-stopped"},
			},
			NetworkingConfig: &network.NetworkingConfig{
				EndpointsConfig: netCfg,
			},
		},
	}
}
