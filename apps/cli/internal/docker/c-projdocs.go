package docker

import (
	"github.com/projdocs/projdocs/apps/cli/errors"
	"github.com/projdocs/projdocs/apps/cli/internal/config"
)

var ProjDocs SupabaseAbstractContainerConstructor = func(supabase *config.Supabase) ContainerConstructor {
	return func() (*Container, error) {
		return nil, errors.NotImplemented
	}
}
