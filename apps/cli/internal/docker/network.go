package docker

import (
	"context"
	"fmt"

	"github.com/moby/moby/api/types/network"
	"github.com/moby/moby/client"
)

const MainNetworkName = "projdocs-net"
const SafeConvertNetworkName = "projdocs-safe-convert-net"

func MakeNetworkConfig(aliases ...string) *network.NetworkingConfig {
	cfg := make(map[string]*network.EndpointSettings, 1)
	cfg[MainNetworkName] = &network.EndpointSettings{
		Aliases: aliases,
	}
	return &network.NetworkingConfig{
		EndpointsConfig: cfg,
	}
}

func (docker *Client) EnsureMainNetwork(ctx context.Context) error {
	_, err := docker.api.NetworkInspect(ctx, MainNetworkName, client.NetworkInspectOptions{Verbose: true})
	if err != nil {
		if isNetworkNotFoundErr(err) {
			if _, err := docker.api.NetworkCreate(ctx, MainNetworkName, client.NetworkCreateOptions{
				Driver:     "bridge",
				Scope:      "local",
				EnableIPv4: new(true),
				EnableIPv6: new(true),
				Internal:   false, // true = no external connectivity (usually keep false)
				Attachable: true,  // allow standalone containers to attach/detach
			}); err != nil {
				return fmt.Errorf("failed to create network: %v", err)
			}
		} else {
			return fmt.Errorf("failed to inspect network: %v", err)
		}
	}
	return nil
}

func (docker *Client) EnsureSafeConvertNetwork(ctx context.Context) error {
	_, err := docker.api.NetworkInspect(ctx, SafeConvertNetworkName, client.NetworkInspectOptions{Verbose: true})
	if err != nil {
		if isNetworkNotFoundErr(err) {
			if _, err := docker.api.NetworkCreate(ctx, SafeConvertNetworkName, client.NetworkCreateOptions{
				Driver:     "bridge",
				Scope:      "local",
				EnableIPv4: new(true),
				EnableIPv6: new(true),
				Internal:   true,
				Attachable: true, // allow standalone containers to attach/detach
			}); err != nil {
				return fmt.Errorf("failed to create network: %v", err)
			}
		} else {
			return fmt.Errorf("failed to inspect network: %v", err)
		}
	}
	return nil
}
