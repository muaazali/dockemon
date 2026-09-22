package bindings

import (
	docker_commands "dockemon/core/commands"
	"dockemon/core/models"
	"log"
)

type HostStatsBindings struct{}

func (h *HostStatsBindings) GetHostStats(hostId string) models.HostStats {
	stats, err := docker_commands.GetHostStats(hostId)
	if err != nil {
		log.Println("Unable to fetch host stats!")
		log.Println(err.Error())
		return models.HostStats{}
	}
	return stats
}
