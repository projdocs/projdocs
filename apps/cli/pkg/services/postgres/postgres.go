package postgres

import (
	"crypto/md5"
	_ "embed"
	"encoding/csv"
	"encoding/hex"
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/api/types/mount"
	"github.com/moby/moby/client"
	config2 "github.com/projdocs/projdocs/apps/cli/internal/config"
	"github.com/projdocs/projdocs/apps/cli/internal/docker"
	"github.com/projdocs/projdocs/apps/cli/internal/migrations"
	"github.com/projdocs/projdocs/apps/cli/pkg"
	"github.com/projdocs/projdocs/apps/cli/pkg/types"
	"github.com/projdocs/projdocs/apps/cli/pkg/types/embeds"
)

//go:embed realtime.sql
var RealtimeSQL []byte

//go:embed webhooks.sql
var WebhooksSQL []byte

//go:embed roles.sql
var RolesSQL []byte

//go:embed jwt.sql
var JwtSQL []byte

//go:embed _supabase.sql
var SupabaseSQL []byte

//go:embed logs.sql
var LogsSQL []byte

//go:embed pooler.sql
var PoolerSQL []byte

var ContainerName = "projdocs-supabase-postgres"

const createMigrationsTable = `
CREATE SCHEMA IF NOT EXISTS supabase_migrations;

CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations ();

ALTER TABLE supabase_migrations.schema_migrations
    ADD COLUMN IF NOT EXISTS version text NOT NULL;

ALTER TABLE supabase_migrations.schema_migrations
    ADD COLUMN IF NOT EXISTS checksum text NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'schema_migrations_pkey'
        AND conrelid = 'supabase_migrations.schema_migrations'::regclass
    ) THEN
        ALTER TABLE supabase_migrations.schema_migrations
            ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);
    END IF;
END
$$;
`

const fmtUpdatePassword = `
ALTER USER anon                       WITH PASSWORD '%s';
ALTER USER authenticated              WITH PASSWORD '%s';
ALTER USER authenticator              WITH PASSWORD '%s';
ALTER USER dashboard_user             WITH PASSWORD '%s';
ALTER USER pgbouncer                  WITH PASSWORD '%s';
ALTER USER postgres                   WITH PASSWORD '%s';
ALTER USER service_role               WITH PASSWORD '%s';
ALTER USER supabase_admin             WITH PASSWORD '%s';
ALTER USER supabase_auth_admin        WITH PASSWORD '%s';
ALTER USER supabase_read_only_user    WITH PASSWORD '%s';
ALTER USER supabase_functions_admin   WITH PASSWORD '%s';
ALTER USER supabase_replication_admin WITH PASSWORD '%s';
ALTER USER supabase_storage_admin     WITH PASSWORD '%s';
`

var ServiceConstructor types.ServiceConstructor = func(cfg config2.Config) *types.ServiceConstructorResult {

	updatePassword := fmt.Sprintf(
		fmtUpdatePassword,
		cfg.Supabase.Postgres.Password,
		cfg.Supabase.Postgres.Password,
		cfg.Supabase.Postgres.Password,
		cfg.Supabase.Postgres.Password,
		cfg.Supabase.Postgres.Password,
		cfg.Supabase.Postgres.Password,
		cfg.Supabase.Postgres.Password,
		cfg.Supabase.Postgres.Password,
		cfg.Supabase.Postgres.Password,
		cfg.Supabase.Postgres.Password,
		cfg.Supabase.Postgres.Password,
		cfg.Supabase.Postgres.Password,
		cfg.Supabase.Postgres.Password,
	)

	return &types.ServiceConstructorResult{
		AfterStartExec: []string{
			"psql",
			"-h", "127.0.0.1",
			"-U", "supabase_admin",
			"-d", "postgres",
			"-v", "ON_ERROR_STOP=1",
			"-c", updatePassword + "\n" + createMigrationsTable,
		},
		AfterStart: func(exec types.ExecInContainer) error {

			type migration struct{ version, checksum, contents string }
			var appliedMigras = make(map[string]migration)
			if output, err := exec([]string{
				"psql",
				"-h", "127.0.0.1",
				"-U", "supabase_admin",
				"-d", "postgres",
				"-v", "ON_ERROR_STOP=1",
				"-t", "-A", "--csv", // returning tuples
				"-c",
				"SELECT version, checksum FROM supabase_migrations.schema_migrations ORDER BY version",
			}); err != nil {
				return fmt.Errorf("query existing migrations: %s", err.Error())
			} else if records, err := csv.NewReader(strings.NewReader(output)).ReadAll(); err != nil {
				return fmt.Errorf("parse existing migrations: %s", err.Error())
			} else {
				for _, row := range records {
					appliedMigras[row[0]] = migration{
						version:  row[0],
						checksum: row[1],
					}
				}
			}

			var applyMigras = []migration{}
			if migras, err := migrations.Get(); err != nil {
				panic(fmt.Errorf("failed to get migrations: %w", err))
			} else {
				for _, migra := range migras {

					version := strings.Split(migra.Name, ".")[0]
					hash := md5.Sum(migra.Contents)
					checksum := hex.EncodeToString(hash[:])

					if appliedMigra, exists := appliedMigras[version]; exists {
						if appliedMigra.checksum != checksum {
							return fmt.Errorf("bad migration: %s: applied checksum (%s) != expected checksum (%s)", version, appliedMigra.checksum, checksum)
						}
						continue
					}

					applyMigras = append(applyMigras, migration{
						version:  version,
						checksum: checksum,
						contents: string(migra.Contents),
					})
				}
			}

			for _, migra := range applyMigras {

				script := fmt.Sprintf(`
BEGIN;

%s

INSERT INTO supabase_migrations.schema_migrations (version, checksum)
VALUES ('%s', '%s');

COMMIT;
`, migra.contents, migra.version, migra.checksum)

				if output, err := exec([]string{
					"psql",
					"-h", "127.0.0.1",
					"-U", "supabase_admin",
					"-d", "postgres",
					"-v", "ON_ERROR_STOP=1",
					"-v", "version=" + migra.version,
					"-v", "checksum=" + migra.checksum,
					"-c", script,
				}); err != nil {
					return fmt.Errorf("apply migration: %s: %s: %s", migra.version, err.Error(), output)
				}
			}

			//// apply migrations

			return nil
		},
		Embeds: []*embeds.EmbeddedFile{
			//{
			//	Path: "/etc/postgresql-custom/pgsodium_root.key",
			//	Data: []byte(cfg.Keys.PgSodiumEncryption),
			//},
			{
				Data: RealtimeSQL,
				Path: embeds.MustParsePath("/docker-entrypoint-initdb.d/migrations/99-realtime.sql"),
			},
			{
				Data: WebhooksSQL,
				Path: embeds.MustParsePath("/docker-entrypoint-initdb.d/init-scripts/98-webhooks.sql"),
			},
			{
				Data: RolesSQL,
				Path: embeds.MustParsePath("/docker-entrypoint-initdb.d/init-scripts/99-roles.sql"),
			},
			{
				Data: JwtSQL,
				Path: embeds.MustParsePath("/docker-entrypoint-initdb.d/init-scripts/99-jwt.sql"),
			},
			{
				Data: SupabaseSQL,
				Path: embeds.MustParsePath("/docker-entrypoint-initdb.d/migrations/97-_supabase.sql"),
			},
			{
				Data: LogsSQL,
				Path: embeds.MustParsePath("/docker-entrypoint-initdb.d/migrations/99-logs.sql"),
			},
			{
				Data: PoolerSQL,
				Path: embeds.MustParsePath("/docker-entrypoint-initdb.d/migrations/99-pooler.sql"),
			},
		},
		Container: &client.ContainerCreateOptions{
			Name:  ContainerName,
			Image: "ghcr.io/supabase/postgres:17.6.1.084",
			Config: &container.Config{
				Labels: map[string]string{
					"com.docker.compose.project": "projdocs",
					"com.projdocs.version":       pkg.Version,
				},
				Env: []string{
					"POSTGRES_HOST=/var/run/postgresql",
					"PGPORT=5432",
					"POSTGRES_PORT=5432",
					"PGPASSWORD=" + cfg.Supabase.Postgres.Password,
					"POSTGRES_PASSWORD=" + cfg.Supabase.Postgres.Password,
					"PGDATABASE=postgres",
					"POSTGRES_DB=postgres",
					"JWT_SECRET=" + cfg.Supabase.Keys.JWTSecret,
					"JWT_EXP=3600",
				},
				Healthcheck: &container.HealthConfig{
					Test:     []string{"CMD", "pg_isready", "-U", "postgres", "-h", "localhost"},
					Interval: 5 * time.Second,
					Timeout:  5 * time.Second,
					Retries:  10,
				},
				Cmd: []string{
					"postgres",
					"-c",
					"config_file=/etc/postgresql/postgresql.conf",
					"-c",
					"log_min_messages=fatal",
				},
			},
			HostConfig: &container.HostConfig{
				RestartPolicy: container.RestartPolicy{Name: "unless-stopped"},
				Mounts: []mount.Mount{
					{
						Type:   mount.TypeBind,
						Source: filepath.Join(config2.GetConfigDirPath(), "postgres"),
						Target: "/var/lib/postgresql/data",
					},
				},
			},
			NetworkingConfig: docker.MakeNetworkConfig("db"),
		},
	}
}
