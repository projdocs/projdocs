package supabase

import (
	"fmt"
	"github.com/projdocs/projdocs/apps/cli/internal/config"
	"github.com/projdocs/projdocs/apps/cli/internal/docker"
	"github.com/projdocs/projdocs/apps/cli/internal/docker/supabase/kong"
)

var Kong docker.SupabaseAbstractContainerConstructor = func(cfg *config.Supabase) docker.ContainerConstructor {
	return func() (*docker.Container, error) {
		return &docker.Container{
			Name:  kong.ContainerName,
			Image: "docker.io/kong:3.9.1",
			Embeds: []*docker.EmbeddedFile{
				{
					Data: kong.ConfigFile,
					Path: "/var/tmp/kong.yml",
				},
			},
			Entrypoint: []string{
				"sh",
				"-c",
				`set -euo
_contents="$(cat /var/tmp/kong.yml)";
_rendered="$(eval "echo \"$_contents\"")";
printf '%s' "$_rendered" > /usr/local/kong/kong.yml;
/docker-entrypoint.sh kong docker-start;`,
			},
			Env: []string{
				fmt.Sprintf("%s=%s", "KONG_STATUS_LISTEN", "127.0.0.1:8100"),
				fmt.Sprintf("%s=%s", "KONG_DATABASE", "off"),
				fmt.Sprintf("%s=%s", "KONG_DECLARATIVE_CONFIG", "/usr/local/kong/kong.yml"),
				fmt.Sprintf("%s=%s", "KONG_DNS_ORDER", "LAST,A,CNAME"),
				fmt.Sprintf("%s=%s", "KONG_PLUGINS", "request-transformer,cors,key-auth,acl,basic-auth,request-termination,ip-restriction"),
				fmt.Sprintf("%s=%s", "KONG_NGINX_PROXY_PROXY_BUFFER_SIZE", "160k"),
				fmt.Sprintf("%s=%s", "KONG_NGINX_PROXY_PROXY_BUFFERS", "64 160k"),
				fmt.Sprintf("%s=%s", "SUPABASE_ANON_KEY", cfg.Keys.PublicJwt),
				fmt.Sprintf("%s=%s", "SUPABASE_SERVICE_KEY", cfg.Keys.PrivateJwt),
				fmt.Sprintf("%s=%s", "DASHBOARD_USERNAME", cfg.Dashboard.Username),
				fmt.Sprintf("%s=%s", "DASHBOARD_PASSWORD", cfg.Dashboard.Password),
			},
			Ports: []*docker.PortBindingMap{
				{
					ContainerPort: 8000,
					Server: &docker.PortBinding{
						Host: "127.0.0.1",
						Port: 8000,
					},
				},
			},
		}, nil
	}
}
