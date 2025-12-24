package docker

import (
	"fmt"
	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/api/types/network"
	"github.com/moby/moby/client"
	"net/netip"
)

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

	Name       string
	Image      string
	Embeds     []*EmbeddedFile
	Ports      []*PortBindingMap
	Entrypoint []string
	Env        []string
}

type ContainerConstructor func() (*Container, error)

func (c *Container) GetContainerCreateOptions() (*client.ContainerCreateOptions, error) {

	ports, err := c.GetPortBindings()
	if err != nil {
		return nil, fmt.Errorf("could not get port bindings: %w", err)
	}

	return &client.ContainerCreateOptions{
		Config: &container.Config{
			Image:      c.Image,
			Entrypoint: c.Entrypoint,
			Env:        c.Env,
		},
		HostConfig: &container.HostConfig{
			PortBindings: ports,
		},
		NetworkingConfig: nil,
		Name:             c.Name,
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
