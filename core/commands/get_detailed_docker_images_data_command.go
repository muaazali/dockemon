package docker_commands

import (
	"dockemon/core/models"
	"encoding/json"
	"log"
	"os/exec"
)

func GetDetailedDockerImagesData() ([]models.DockerContainerData, error) {
	// cmd := exec.Command("docker", "inspect $(docker images -q) --format=json")
	cmd := exec.Command("powershell", "-Command", "docker inspect $(docker images -q) --format=json")

	log.Println("Executing: docker inspect $(docker images -q) --format=json")

	stdout, err := cmd.Output()
	if err != nil {
		log.Print("Error executing docker inspect: ", err.Error())
		return nil, err
	}

	outputString := string(stdout)
	log.Println(outputString)

	dockerImagesDetailed := []models.DockerContainerDataInternal{}

	err = json.Unmarshal([]byte(outputString), &dockerImagesDetailed)
	if err != nil {
		log.Println(err.Error())
		return nil, err
	}


	return convertToDockerContainerData(dockerImagesDetailed), nil
}

func convertToDockerContainerData(dockerImagesDetailed []models.DockerContainerDataInternal) []models.DockerContainerData {
	converted := []models.DockerContainerData{}
	for _, image := range dockerImagesDetailed {
		converted = append(converted, models.DockerContainerData{
			ID:                  image.ID,
			RepoTag:             firstRepoTagWithoutVersion(image.RepoTags),
			RepoTitle:           image.RepoTags[0],
			Comment:             image.Comment,
			Created:             image.Created,
			Size:                image.Size,
			ComposeProjectTitle: image.Config.Labels.ComDockerComposeProject,
		})
	}
	return converted
}

func firstRepoTagWithoutVersion(repoTags []string) string {
	const defaultTag = ""
	if len(repoTags) == 0 {
		return defaultTag
	}
	firstTag := repoTags[0]
	colonIndex := -1
	for i := len(firstTag) - 1; i >= 0; i-- {
		if firstTag[i] == ':' {
			colonIndex = i
			break
		}
	}
	if colonIndex == -1 {
		return firstTag
	}
	return firstTag[:colonIndex]
}