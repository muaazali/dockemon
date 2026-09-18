package docker_commands

import (
	"dockemon/core/commandbuilder"
	"dockemon/core/models"
	"fmt"
	"log"
	"strings"
)

func ListDockerImages(hostId ...string) ([]models.DockerImage, error) {
	cb := commandbuilder.NewCommandBuilder(hostId...)

	outputString, err := cb.Execute("docker images")
	if err != nil {
		return nil, err
	}

	dockerImages := []models.DockerImage{}
	for _, line := range strings.Split(outputString, "\n")[1:] {
		if len(line) == 0 {
			continue
		}

		var image models.DockerImage
		_, err := fmt.Sscanf(line, "%s %s %s %s %s %s", &image.Image, &image.ID, &image.DiskUsage, &image.ContentSize, &image.Extra)
		if err != nil && err.Error() != "EOF" {
			log.Println(err.Error())
			return nil, err
		}
		dockerImages = append(dockerImages, image)
	}

	return dockerImages, nil
}
