package docker

import (
	"fmt"
	"net/url"
	"os"
	"syscall"
)

func (docker *Client) SocketGID() (uint32, error) {

	host := docker.api.DaemonHost()
	u, err := url.Parse(host)
	if err != nil {
		return 0, fmt.Errorf("parse docker host: %w", err)
	}

	var socketPath string
	switch u.Scheme {
	case "unix":
		socketPath = u.Path // "/var/run/docker.sock"
	default:
		return 0, fmt.Errorf("unsupported docker host scheme: %q", u.Scheme)
	}

	info, err := os.Stat(socketPath)
	if err != nil {
		return 0, fmt.Errorf("stat docker socket: %w", err)
	}
	stat, ok := info.Sys().(*syscall.Stat_t)
	if !ok {
		return 0, fmt.Errorf("unexpected stat type")
	}
	return stat.Gid, nil
}
