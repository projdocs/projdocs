package supabase

import (
	"fmt"
	"github.com/moby/moby/api/types/container"
	"github.com/projdocs/projdocs/apps/cli/internal/config"
	"github.com/projdocs/projdocs/apps/cli/internal/docker"
	"github.com/projdocs/projdocs/apps/cli/internal/docker/supabase/postgres"
	"github.com/projdocs/projdocs/apps/cli/internal/utils"
	"time"
)

var Realtime docker.SupabaseAbstractContainerConstructor = func(cfg *config.Supabase) docker.ContainerConstructor {
	return func() (*docker.Container, error) {
		return &docker.Container{
			Name:  "realtime-dev.supabase-realtime",
			Image: "ghcr.io/supabase/realtime:v2.68.0",
			HealthCheck: &container.HealthConfig{
				Interval: 5 * time.Second,
				Timeout:  5 * time.Second,
				Retries:  3,
				Test: []string{
					"CMD-SHELL",
					fmt.Sprintf("curl -sSfL --head -o /dev/null -H \"Authorization: Bearer %s\" http://localhost:4000/api/tenants/realtime-dev/health", cfg.Keys.PublicJwt),
				},
			},
			Env: []string{
				fmt.Sprintf("%s=%s", "PORT", "4000"),
				fmt.Sprintf("%s=%s", "DB_HOST", postgres.ContainerName),
				fmt.Sprintf("%s=%s", "DB_PORT", "5432"),
				fmt.Sprintf("%s=%s", "DB_USER", "supabase_admin"),
				fmt.Sprintf("%s=%s", "DB_PASSWORD", cfg.Database.Password),
				fmt.Sprintf("%s=%s", "DB_NAME", "postgres"),
				fmt.Sprintf("%s=%s", "DB_AFTER_CONNECT_QUERY", "SET search_path TO _realtime"),
				fmt.Sprintf("%s=%s", "DB_ENC_KEY", "supabaserealtime"),
				fmt.Sprintf("%s=%s", "API_JWT_SECRET", cfg.Keys.JwtSecret),
				fmt.Sprintf("%s=%s", "SECRET_KEY_BASE", utils.RandomString(64)),
				fmt.Sprintf("%s=%s", "ERL_AFLAGS", "-proto_dist inet_tcp"),
				fmt.Sprintf("%s=%s", "DNS_NODES", "''"),
				fmt.Sprintf("%s=%s", "RLIMIT_NOFILE", "10000"),
				fmt.Sprintf("%s=%s", "APP_NAME", "realtime"),
				fmt.Sprintf("%s=%s", "SEED_SELF_HOST", "true"),
				fmt.Sprintf("%s=%s", "RUN_JANITOR", "true"),
			},
		}, nil
	}
}
