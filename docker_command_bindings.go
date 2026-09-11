package main

import (
	"context"
	docker_commands "dockemon/core/commands"
	"log"
)

type DockerCommandBindings struct {
	ctx context.Context
}

func (d *DockerCommandBindings) ListDockerImages() []docker_commands.DockerImage {
	images, err := docker_commands.ListDockerImages()
	if err != nil {
		log.Println("Unable to fetch docker images!")
		log.Println(err.Error())
		return nil
	}
	return images
}