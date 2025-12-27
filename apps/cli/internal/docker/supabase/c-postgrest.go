package supabase

import (
	"fmt"
	"github.com/projdocs/projdocs/apps/cli/internal/config"
	"github.com/projdocs/projdocs/apps/cli/internal/docker"
	"github.com/projdocs/projdocs/apps/cli/internal/docker/supabase/postgres"
)

var Postgrest docker.SupabaseAbstractContainerConstructor = func(cfg *config.Supabase) docker.ContainerConstructor {
	return func() (*docker.Container, error) {
		return &docker.Container{
			Name:       "projdocs-supabase-rest",
			Image:      "docker.io/postgrest/postgrest:v14.1",
			Embeds:     nil,
			Ports:      nil,
			Entrypoint: nil,
			Env: []string{
				fmt.Sprintf("PGRST_DB_URI=postgres://authenticator:%s@%s:5432/postgres", cfg.Database.Password, postgres.ContainerName),
				"PGRST_ADMIN_SERVER_PORT=3001",
				"PGRST_DB_SCHEMAS=public",
				"PGRST_DB_ANON_ROLE=anon",
				fmt.Sprintf("PGRST_JWT_SECRET=%s", cfg.Keys.JwtSecret),
				"PGRST_DB_USE_LEGACY_GUCS=false",
				fmt.Sprintf("PGRST_APP_SETTINGS_JWT_SECRET=%s", cfg.Keys.JwtSecret),
				"PGRST_APP_SETTINGS_JWT_EXP=3600",
			},
		}, nil
	}
}
