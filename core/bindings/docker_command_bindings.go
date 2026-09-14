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

func (d *DockerCommandBindings) ListDockerImages() []models.DockerImage {
	images, err := docker_commands.ListDockerImages()
	if err != nil {
		log.Println("Unable to fetch docker images!")
		log.Println(err.Error())
		return nil
	}
	return images
}

func (d *DockerCommandBindings) GetDetailedDockerImagesData() []models.DockerContainerData {
	data, err := docker_commands.GetDetailedDockerImagesData()
	if err != nil {
		log.Println("Unable to fetch detailed docker images data!")
		log.Println(err.Error())
		return nil
	}
	return data
}