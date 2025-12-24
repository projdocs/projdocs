package supabase

import (
	"fmt"
	"github.com/projdocs/projdocs/apps/cli/internal/config"
	"github.com/projdocs/projdocs/apps/cli/internal/docker"
)

type SupabaseContainerConstructor func(*config.Supabase) docker.ContainerConstructor

func AllC(cfg *config.Supabase) []docker.ContainerConstructor {
	return []docker.ContainerConstructor{
		Kong(cfg),
	}
}

func All(cfg *config.Supabase) ([]*docker.Container, error) {
	var containers []*docker.Container
	constructors := AllC(cfg)
	for i, constructor := range constructors {
		svc, err := constructor()
		if err != nil {
			return nil, fmt.Errorf("error creating supabase container %d: %w", i, err)
		}
		containers = append(containers, svc)
	}
	return containers, nil
}
