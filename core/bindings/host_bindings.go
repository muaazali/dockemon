package bindings

import (
	docker_commands "dockemon/core/commands"
	"dockemon/core/models"
	"log"
)

type HostBindings struct{}

func (h *HostBindings) AddHost(host models.Host) bool {
	if err := docker_commands.AddHost(host); err != nil {
		log.Println("Unable to add host!")
		log.Println(err.Error())
		return false
	}
	return true
}

func (h *HostBindings) GetHosts() []models.Host {
	return docker_commands.GetHosts()
}
