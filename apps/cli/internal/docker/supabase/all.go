package supabase

import (
	"fmt"
	"github.com/projdocs/projdocs/apps/cli/internal/config"
	"github.com/projdocs/projdocs/apps/cli/internal/docker"
)

func AllC(cfg *config.Supabase) []docker.ContainerConstructor {
	return []docker.ContainerConstructor{
		Kong(cfg),
		Postgres(cfg),
		Postgrest(cfg),
		Storage(cfg),
		Realtime(cfg),
		Auth(cfg),
	}
}

func All(cfg *config.Supabase, mergeIn ...docker.SupabaseAbstractContainerConstructor) ([]*docker.Container, error) {

	var containers []*docker.Container

	constructors := AllC(cfg)
	for _, constructor := range mergeIn {
		constructors = append(constructors, constructor(cfg))
	}

	for i, constructor := range constructors {
		svc, err := constructor()
		if err != nil {
			return nil, fmt.Errorf("error creating supabase container %d: %w", i, err)
		}
		containers = append(containers, svc)
	}
	return containers, nil
}
