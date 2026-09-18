package bindings

import (
	"context"
	docker_commands "dockemon/core/commands"
	"dockemon/core/models"
	"log"
)

type DockerCommandBindings struct {
	ctx context.Context
}

func (d *DockerCommandBindings) ListDockerImages(hostId string) []models.DockerImage {
	images, err := docker_commands.ListDockerImages(hostId)
	if err != nil {
		log.Println("Unable to fetch docker images!")
		log.Println(err.Error())
		return nil
	}
	return images
}

func (d *DockerCommandBindings) GetDetailedDockerImagesData(hostId string) []models.DockerContainerData {
	data, err := docker_commands.GetDetailedDockerImagesData(hostId)
	if err != nil {
		log.Println("Unable to fetch detailed docker images data!")
		log.Println(err.Error())
		return nil
	}
	return data
}

func (d *DockerCommandBindings) StartDockerContainer(containerID string, hostId string) bool {
	err := docker_commands.StartDockerContainer(containerID, hostId)
	if err != nil {
		log.Println("Unable to start docker container!")
		log.Println(err.Error())
		return false
	}
	return true
}

func (d *DockerCommandBindings) StopDockerContainer(containerID string, hostId string) bool {
	err := docker_commands.StopDockerContainer(containerID, hostId)
	if err != nil {
		log.Println("Unable to stop docker container!")
		log.Println(err.Error())
		return false
	}
	return true
}

func (d *DockerCommandBindings) RestartDockerContainer(containerID string, hostId string) bool {
	err := docker_commands.RestartDockerContainer(containerID, hostId)
	if err != nil {
		log.Println("Unable to restart docker container!")
		log.Println(err.Error())
		return false
	}
	return true
}
