package services

import (
	"github.com/projdocs/projdocs/apps/cli/pkg/services/api"
	"github.com/projdocs/projdocs/apps/cli/pkg/services/auth"
	"github.com/projdocs/projdocs/apps/cli/pkg/services/caddy"
	"github.com/projdocs/projdocs/apps/cli/pkg/services/kong"
	"github.com/projdocs/projdocs/apps/cli/pkg/services/minio"
	"github.com/projdocs/projdocs/apps/cli/pkg/services/postgres"
	"github.com/projdocs/projdocs/apps/cli/pkg/services/postgrest"
	safe_convert "github.com/projdocs/projdocs/apps/cli/pkg/services/safe-convert"
	"github.com/projdocs/projdocs/apps/cli/pkg/services/storage"
	"github.com/projdocs/projdocs/apps/cli/pkg/services/web"
	"github.com/projdocs/projdocs/apps/cli/pkg/types"
)

func GetAll() []types.ServiceConstructor {
	return []types.ServiceConstructor{
		postgres.ServiceConstructor,
		kong.ServiceConstructor,
		caddy.ServiceConstructor,
		postgrest.ServiceConstructor,
		minio.ServiceConstructor,
		storage.ServiceConstructor,
		auth.ServiceConstructor,
		api.ServiceConstructor,
		safe_convert.DockerProxyServiceConstructor,
		safe_convert.ApiServiceConstructor,
		web.ServiceConstructor,
	}
}
