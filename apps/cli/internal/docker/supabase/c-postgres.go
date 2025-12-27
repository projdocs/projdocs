package supabase

import (
	"context"
	"fmt"
	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/api/types/mount"
	"github.com/projdocs/projdocs/apps/cli/internal/config"
	"github.com/projdocs/projdocs/apps/cli/internal/docker"
	"github.com/projdocs/projdocs/apps/cli/internal/docker/supabase/postgres"
	"os"
	"strings"
	"time"
)

var Postgres docker.SupabaseAbstractContainerConstructor = func(cfg *config.Supabase) docker.ContainerConstructor {

	fmtUpdatePassword := `ALTER USER anon                       WITH PASSWORD '%s';
						  ALTER USER authenticated              WITH PASSWORD '%s';
						  ALTER USER authenticator              WITH PASSWORD '%s';
						  ALTER USER dashboard_user             WITH PASSWORD '%s';
						  ALTER USER pgbouncer                  WITH PASSWORD '%s';
						  ALTER USER postgres                   WITH PASSWORD '%s';
						  ALTER USER service_role               WITH PASSWORD '%s';
						  ALTER USER supabase_admin             WITH PASSWORD '%s';
						  ALTER USER supabase_auth_admin        WITH PASSWORD '%s';
						  ALTER USER supabase_read_only_user    WITH PASSWORD '%s';
						  ALTER USER supabase_replication_admin WITH PASSWORD '%s';
						  ALTER USER supabase_storage_admin     WITH PASSWORD '%s';`

	return func() (*docker.Container, error) {

		if stat, err := os.Stat(cfg.Database.DataDirectory); err != nil {
			if os.IsNotExist(err) {
				if err := os.MkdirAll(cfg.Database.DataDirectory, 0755); err != nil {
					return nil, fmt.Errorf("could not create database dir: %w", err)
				} else {
					stat, err = os.Stat(cfg.Database.DataDirectory)
				}
			} else {
				return nil, fmt.Errorf("could not get database dir (%s): %w", cfg.Database.DataDirectory, err)
			}
		} else if !stat.IsDir() {
			return nil, fmt.Errorf("database dir (%s) is not a directory", cfg.Database.DataDirectory)
		}

		return &docker.Container{
			Name:  postgres.ContainerName,
			Image: "ghcr.io/supabase/postgres:17.6.1.066",
			Command: []string{
				"postgres",
				"-c", "config_file=/etc/postgresql/postgresql.conf",
				"-c", "log_min_messages=error",
				"-c", "archive_mode=off",
			},
			Mounts: []mount.Mount{
				{
					Type:   mount.TypeBind,
					Source: cfg.Database.DataDirectory,
					Target: "/var/lib/postgresql/data",
				},
			},
			Env: []string{
				"POSTGRES_HOST=/var/run/postgresql",
				"PGPORT=5432",
				"POSTGRES_PORT=5432",
				fmt.Sprintf("PGPASSWORD=%s", cfg.Database.Password),
				fmt.Sprintf("POSTGRES_PASSWORD=%s", cfg.Database.Password),
				"PGDATABASE=postgres",
				"POSTGRES_DB=postgres",
				fmt.Sprintf("JWT_SECRET=%s", cfg.Keys.JwtSecret),
				"JWT_EXP=3600",
			},
			HealthCheck: &container.HealthConfig{
				Interval: 5 * time.Second,
				Timeout:  5 * time.Second,
				Retries:  10,
				Test: []string{
					"CMD",
					"pg_isready",
					"-U", "postgres",
					"-h", "localhost",
				},
			},
			AfterStart: func(ctx context.Context, docker *docker.Docker, container *docker.Container) (string, error) {

				// patch postgres password
				p := cfg.Database.Password
				output, err := docker.ExecInContainer(ctx, container, []string{
					"psql",
					"-h", "127.0.0.1",
					"-U", "supabase_admin",
					"-d", "postgres",
					"-v", "ON_ERROR_STOP=1",
					"-c",
					fmt.Sprintf(fmtUpdatePassword, p, p, p, p, p, p, p, p, p, p, p, p),
				})
				if err != nil {
					return output, fmt.Errorf("failed to patch postgres password: %v (%s)", err, strings.ReplaceAll(strings.TrimSpace(output), "\n", "\\n"))
				}
				return output, nil
			},
			Embeds: []*docker.EmbeddedFile{
				{
					Path: "/etc/postgresql-custom/pgsodium_root.key",
					Data: []byte(cfg.Keys.PgSodiumEncryption),
				},
				{
					Data: postgres.RealtimeSQL,
					Path: "/docker-entrypoint-initdb.d/migrations/99-realtime.sql",
				},
				{
					Data: postgres.WebhooksSQL,
					Path: "/docker-entrypoint-initdb.d/init-scripts/98-webhooks.sql",
				},
				{
					Data: postgres.RolesSQL,
					Path: "/docker-entrypoint-initdb.d/init-scripts/99-roles.sql",
				},
				{
					Data: postgres.JwtSQL,
					Path: "/docker-entrypoint-initdb.d/init-scripts/99-jwt.sql",
				},
				{
					Data: postgres.SupabaseSQL,
					Path: "/docker-entrypoint-initdb.d/migrations/97-_supabase.sql",
				},
				{
					Data: postgres.LogsSQL,
					Path: "/docker-entrypoint-initdb.d/migrations/99-logs.sql",
				},
				{
					Data: postgres.PoolerSQL,
					Path: "/docker-entrypoint-initdb.d/migrations/99-pooler.sql",
				},
			},
		}, nil
	}
}
