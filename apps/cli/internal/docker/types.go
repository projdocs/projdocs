package docker

import (
	"context"
	"fmt"
	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/api/types/mount"
	"github.com/moby/moby/api/types/network"
	"github.com/moby/moby/client"
	"github.com/projdocs/projdocs/apps/cli/internal/config"
	net "github.com/projdocs/projdocs/apps/cli/internal/docker/network"
	"github.com/projdocs/projdocs/apps/cli/pkg"
	"net/netip"
	"sync"
)

type Docker struct {
	api  *client.Client
	lock sync.Mutex
}

func NewClient(api *client.Client) *Docker {
	return &Docker{
		api: api,
	}
}

type PortBinding struct {
	Host string
	Port uint16
}

type PortBindingMap struct {
	Server        *PortBinding
	ContainerPort uint16
}

type EmbeddedFile struct {
	Data []byte
	Path string
}

type Container struct {
	created *client.ContainerCreateResult
	started *client.ContainerStartResult

	Name        string
	Image       string
	Embeds      []*EmbeddedFile
	Mounts      []mount.Mount
	Ports       []*PortBindingMap
	Entrypoint  []string
	Command     []string
	Env         []string
	HealthCheck *container.HealthConfig
	AfterStart  func(ctx context.Context, docker *Docker, container *Container) (string, error)
}

func (this *Container) GetID() string {
	if this.created == nil {
		return this.Name
	}
	return this.created.ID
}

type ContainerConstructor func() (*Container, error)

type SupabaseAbstractContainerConstructor func(*config.Supabase) ContainerConstructor

func (c *Container) GetContainerCreateOptions() (*client.ContainerCreateOptions, error) {

	ports, err := c.GetPortBindings()
	if err != nil {
		return nil, fmt.Errorf("could not get port bindings: %w", err)
	}

	exposedPorts := network.PortSet{}
	for port := range ports {
		exposedPorts[port] = struct{}{}
	}

	return &client.ContainerCreateOptions{
		Config: &container.Config{
			Image:        c.Image,
			Entrypoint:   c.Entrypoint,
			Cmd:          c.Command,
			Env:          c.Env,
			Healthcheck:  c.HealthCheck,
			ExposedPorts: exposedPorts,
			Labels: map[string]string{
				"com.docker.compose.project": "projdocs",
				"com.projdocs.version":       pkg.Version,
			},
		},
		HostConfig: &container.HostConfig{
			PortBindings:  ports,
			Mounts:        c.Mounts,
			AutoRemove:    false,
			RestartPolicy: container.RestartPolicy{Name: "no"},
			NetworkMode:   container.NetworkMode(net.Name),
		},
		NetworkingConfig: &network.NetworkingConfig{
			EndpointsConfig: map[string]*network.EndpointSettings{
				net.Name: {},
			},
		},
		Name: c.Name,
	}, nil
}

func (c *Container) GetPortBindings() (network.PortMap, error) {

	bindings := network.PortMap{}

	for i, port := range c.Ports {
		hostIP, err := netip.ParseAddr(port.Server.Host)
		if err != nil {
			return nil, fmt.Errorf("error in binding %d: could not parse host IP: %v", i, err)
		}
		containerPort, err := network.ParsePort(fmt.Sprintf("%d/tcp", port.ContainerPort))
		if err != nil {
			return nil, fmt.Errorf("error in binding %d: could not parse container port: %v", i, err)
		}
		bindings[containerPort] = []network.PortBinding{
			{
				HostIP:   hostIP,
				HostPort: fmt.Sprintf("%d", port.Server.Port),
			},
		}
	}

	return bindings, nil

}
