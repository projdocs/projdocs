package supabase

import (
	"fmt"
	"github.com/moby/moby/api/types/container"
	"github.com/projdocs/projdocs/apps/cli/internal/config"
	"github.com/projdocs/projdocs/apps/cli/internal/docker"
	"github.com/projdocs/projdocs/apps/cli/internal/docker/supabase/postgres"
	"time"
)

var Auth docker.SupabaseAbstractContainerConstructor = func(cfg *config.Supabase) docker.ContainerConstructor {
	return func() (*docker.Container, error) {
		return &docker.Container{
			Name:  "projdocs-supabase-auth",
			Image: "ghcr.io/supabase/gotrue:v2.184.0",
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
					"http://localhost:9999/health",
				},
			},
			Env: []string{
				fmt.Sprintf("%s=%s", "GOTRUE_API_HOST", "0.0.0.0"),
				fmt.Sprintf("%s=%s", "GOTRUE_API_PORT", "9999"),
				fmt.Sprintf("%s=%s", "API_EXTERNAL_URL", cfg.Kong.URLs.Kong),

				fmt.Sprintf("%s=%s", "GOTRUE_DB_DRIVER", "postgres"),
				fmt.Sprintf(
					"%s=%s",
					"GOTRUE_DB_DATABASE_URL",
					fmt.Sprintf(
						"postgres://supabase_auth_admin:%s@%s:5432/postgres",
						cfg.Database.Password,
						postgres.ContainerName,
					),
				),

				fmt.Sprintf("%s=%s", "GOTRUE_SITE_URL", cfg.Kong.URLs.Site),
				fmt.Sprintf("%s=%s", "GOTRUE_URI_ALLOW_LIST", ""),
				fmt.Sprintf("%s=%s", "GOTRUE_DISABLE_SIGNUP", "true"),

				fmt.Sprintf("%s=%s", "GOTRUE_JWT_ADMIN_ROLES", "service_role"),
				fmt.Sprintf("%s=%s", "GOTRUE_JWT_AUD", "authenticated"),
				fmt.Sprintf("%s=%s", "GOTRUE_JWT_DEFAULT_GROUP_NAME", "authenticated"),
				fmt.Sprintf("%s=%s", "GOTRUE_JWT_EXP", "3600"),
				fmt.Sprintf("%s=%s", "GOTRUE_JWT_SECRET", cfg.Keys.JwtSecret),

				fmt.Sprintf("%s=%s", "GOTRUE_EXTERNAL_EMAIL_ENABLED", "false"),
				fmt.Sprintf("%s=%s", "GOTRUE_EXTERNAL_ANONYMOUS_USERS_ENABLED", "false"),
				fmt.Sprintf("%s=%s", "GOTRUE_MAILER_AUTOCONFIRM", "true"),

				fmt.Sprintf("%s=%s", "GOTRUE_SMTP_ADMIN_EMAIL", cfg.Kong.SMTP.From.Email),
				fmt.Sprintf("%s=%s", "GOTRUE_SMTP_HOST", cfg.Kong.SMTP.Host),
				fmt.Sprintf("%s=%d", "GOTRUE_SMTP_PORT", cfg.Kong.SMTP.Port),
				fmt.Sprintf("%s=%s", "GOTRUE_SMTP_USER", cfg.Kong.SMTP.User),
				fmt.Sprintf("%s=%s", "GOTRUE_SMTP_PASS", cfg.Kong.SMTP.Pass),
				fmt.Sprintf("%s=%s", "GOTRUE_SMTP_SENDER_NAME", cfg.Kong.SMTP.From.Name),
				fmt.Sprintf("%s=%s", "GOTRUE_MAILER_URLPATHS_INVITE", "/auth/v1/verify"),
				fmt.Sprintf("%s=%s", "GOTRUE_MAILER_URLPATHS_CONFIRMATION", "/auth/v1/verify"),
				fmt.Sprintf("%s=%s", "GOTRUE_MAILER_URLPATHS_RECOVERY", "/auth/v1/verify"),
				fmt.Sprintf("%s=%s", "GOTRUE_MAILER_URLPATHS_EMAIL_CHANGE", "/auth/v1/verify"),

				fmt.Sprintf("%s=%s", "GOTRUE_EXTERNAL_PHONE_ENABLED", "false"),
				fmt.Sprintf("%s=%s", "GOTRUE_SMS_AUTOCONFIRM", "false"),

				// MFA
				"GOTRUE_MFA_PHONE_ENROLL_ENABLED=false",
				"GOTRUE_MFA_PHONE_VERIFY_ENABLED=false",
				"GOTRUE_MFA_TOTP_ENROLL_ENABLED=true",
				"GOTRUE_MFA_TOTP_VERIFY_ENABLED=true",
				"GOTRUE_MFA_WEB_AUTHN_ENROLL_ENABLED=true",
				"GOTRUE_MFA_WEB_AUTHN_VERIFY_ENABLED=true",
				"GOTRUE_MFA_MAX_ENROLLED_FACTORS=10",
			},
		}, nil
	}
}
