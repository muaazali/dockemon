package docker_commands

import (
	"dockemon/core/hosts"
	"dockemon/core/models"
	"errors"
)

func AddHost(host models.Host) error {
	if host.ID == "" {
		return errors.New("host id is required")
	}
	return hosts.RegisterHost(host)
}

func GetHosts() []models.Host {
	return hosts.ListHosts()
}
