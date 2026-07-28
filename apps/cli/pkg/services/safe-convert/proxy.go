package safe_convert

import (
	"fmt"

	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/api/types/mount"
	"github.com/moby/moby/api/types/network"
	"github.com/moby/moby/client"
	"github.com/projdocs/projdocs/apps/cli/internal/config"
	"github.com/projdocs/projdocs/apps/cli/internal/docker"
	"github.com/projdocs/projdocs/apps/cli/pkg"
	"github.com/projdocs/projdocs/apps/cli/pkg/types"
)

const proxy = "projdocs-safe-convert-proxy"

var DockerProxyServiceConstructor types.ServiceConstructor = func(cfg config.Config) *types.ServiceConstructorResult {

	alias := "safe-convert-proxy"
	netCfg := make(map[string]*network.EndpointSettings, 1)

	// private network
	netCfg[docker.SafeConvertNetworkName] = &network.EndpointSettings{
		Aliases: []string{alias},
	}

	return &types.ServiceConstructorResult{
		Container: &client.ContainerCreateOptions{
			Name:  proxy,
			Image: fmt.Sprintf("ghcr.io/projdocs/safe-convert-proxy:%s", Version),
			Config: &container.Config{
				Labels: map[string]string{
					"com.docker.compose.project": "projdocs",
					"com.projdocs.version":       pkg.Version,
				},
				Env: []string{
					fmt.Sprintf("SAFE_CONVERT_ACCESS_TOKEN=%s", cfg.SafeConvert.AccessToken),
				},
			},
			HostConfig: &container.HostConfig{
				RestartPolicy: container.RestartPolicy{Name: "unless-stopped"},
				Mounts: []mount.Mount{
					{
						Type:     mount.TypeBind,
						Source:   "/var/run/docker.sock",
						Target:   "/var/run/docker.sock",
						ReadOnly: true,
					},
				},
				CapDrop:        []string{"ALL"}, // drop ALL capabilities
				SecurityOpt:    []string{"no-new-privileges:true"},
				ReadonlyRootfs: true, // read-only root filesystem
				Tmpfs: map[string]string{
					"/tmp": "size=64m,mode=1777",
				},
				Resources: container.Resources{
					Memory:   512 * 1024 * 1024,
					NanoCPUs: 1e9, // 1 CPU
				},
			},
			NetworkingConfig: &network.NetworkingConfig{
				EndpointsConfig: netCfg,
			},
		},
	}
}
