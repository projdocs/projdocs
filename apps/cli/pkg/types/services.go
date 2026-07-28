package types

import (
	"github.com/moby/moby/client"
	"github.com/projdocs/projdocs/apps/cli/internal/config"
	"github.com/projdocs/projdocs/apps/cli/pkg/types/embeds"
)

type ExecInContainer = func(commands []string) (output string, err error)

type ServiceConstructorResult struct {
	Embeds         []*embeds.EmbeddedFile
	Container      *client.ContainerCreateOptions
	AfterStartExec []string
	AfterStart     func(exec ExecInContainer) error
}

type ServiceConstructor = func(cfg config.Config) *ServiceConstructorResult
