package docker_commands

import (
	"dockemon/core/models"
	"encoding/json"
	"log"
	"os/exec"
	"strings"
)

func GetDetailedDockerImagesData() ([]models.DockerContainerData, error) {
	// cmd := exec.Command("docker", "inspect $(docker images -q) --format=json")
	cmd := exec.Command("powershell", "-Command", "docker inspect $(docker ps -a -q) --format=json")

	log.Println("Executing: docker inspect $(docker ps -a -q) --format=json")

	stdout, err := cmd.Output()
	if err != nil {
		log.Print("Error executing docker inspect: ", err.Error())
		return nil, err
	}

	outputString := string(stdout)
	log.Println(outputString)

	dockerImagesDetailed := []models.DockerContainerDataDetailed{}

	err = json.Unmarshal([]byte(outputString), &dockerImagesDetailed)
	if err != nil {
		log.Println(err.Error())
		return nil, err
	}

	return combineWithStats(convertToSimpleDockerContainerData(dockerImagesDetailed)), nil
}

func convertToSimpleDockerContainerData(dockerContainersDetailed []models.DockerContainerDataDetailed) []models.DockerContainerData {
	converted := []models.DockerContainerData{}
	for _, container := range dockerContainersDetailed {
		converted = append(converted, models.DockerContainerData{
			ID:                  strings.TrimPrefix(container.ID, "sha256:"),
			RepoTitle:           strings.TrimPrefix(container.Name, "/"),
			Created:             container.Created,
			Size:                container.HostConfig.ShmSize,
			ComposeProjectTitle: container.Config.Labels.ComDockerComposeProject,
			IsRunning:             container.State.Running,
			ImageType:				container.Config.Image,
		})
	}
	return converted
}

func combineWithStats(dockerContainers []models.DockerContainerData) []models.DockerContainerData {
	cmd := exec.Command("powershell", "-Command", "docker stats --no-trunc --no-stream --format=json")

	log.Println("Executing: docker stats --no-trunc --no-stream --format=json")

	stdout, err := cmd.Output()
	if err != nil {
		log.Print("Error executing docker stats: ", err.Error())
		return dockerContainers
	}

	outputString := string(stdout)
	log.Println(outputString)

	statsOutputStrings := strings.Split(outputString, "\n")

	dockerContainersStats := []models.DockerStatsInternal{}

	for _, statsOutputString := range statsOutputStrings {
		if statsOutputString == "" {
			continue
		}
		var stats models.DockerStatsInternal
		err = json.Unmarshal([]byte(statsOutputString), &stats)
		if err != nil {
			log.Println(err.Error())
			continue
		}
		dockerContainersStats = append(dockerContainersStats, stats)
	}

	for i, container := range dockerContainers {
		for _, stats := range dockerContainersStats {
			if container.ID == stats.ID {
				dockerContainers[i].CPUPercentage = stats.CPUPerc
				dockerContainers[i].MemoryUsage = stats.MemUsage
				dockerContainers[i].MemoryPercentage = stats.MemPerc
				dockerContainers[i].NetworkIO = stats.NetIO
				dockerContainers[i].BlockIO = stats.BlockIO
				dockerContainers[i].PIDs = stats.PIDs
				break
			}
		}
	}

	return dockerContainers
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