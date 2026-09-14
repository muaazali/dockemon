package docker_commands

import (
	"log"
	"os/exec"
)

func StartDockerContainer(containerID string) error {
	cmd := exec.Command("docker", "start", containerID)

	log.Println("Executing: docker start", containerID)

	_, err := cmd.Output()
	if err != nil {
		log.Println(err.Error())
		return err
	}

	return nil
}

func StopDockerContainer(containerID string) error {
	cmd := exec.Command("docker", "stop", containerID)

	log.Println("Executing: docker stop", containerID)

	_, err := cmd.Output()
	if err != nil {
		log.Println(err.Error())
		return err
	}

	return nil
}

func RestartDockerContainer(containerID string) error {
	cmd := exec.Command("docker", "restart", containerID)

	log.Println("Executing: docker restart", containerID)

	_, err := cmd.Output()
	if err != nil {
		log.Println(err.Error())
		return err
	}

	return nil
}
