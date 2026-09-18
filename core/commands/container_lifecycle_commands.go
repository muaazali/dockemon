package docker_commands

import (
	"dockemon/core/commandbuilder"
	"log"
)

func StartDockerContainer(containerID string, hostId ...string) error {
	cb := commandbuilder.NewCommandBuilder(hostId...)

	log.Println("Executing: docker start", containerID)

	_, err := cb.Execute("docker start " + containerID)
	if err != nil {
		log.Println(err.Error())
		return err
	}

	return nil
}

func StopDockerContainer(containerID string, hostId ...string) error {
	cb := commandbuilder.NewCommandBuilder(hostId...)

	log.Println("Executing: docker stop", containerID)

	_, err := cb.Execute("docker stop " + containerID)
	if err != nil {
		log.Println(err.Error())
		return err
	}

	return nil
}

func RestartDockerContainer(containerID string, hostId ...string) error {
	cb := commandbuilder.NewCommandBuilder(hostId...)

	log.Println("Executing: docker restart", containerID)

	_, err := cb.Execute("docker restart " + containerID)
	if err != nil {
		log.Println(err.Error())
		return err
	}

	return nil
}
