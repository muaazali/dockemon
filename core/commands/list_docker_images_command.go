package docker_commands

import (
	"dockemon/core/models"
	"fmt"
	"log"
	"os/exec"
	"strings"
)

func ListDockerImages() ([]models.DockerImage, error) {
	cmd := exec.Command("docker", "images")

	stdout, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	outputString := string(stdout)

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