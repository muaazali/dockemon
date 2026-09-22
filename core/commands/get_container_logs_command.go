package docker_commands

import (
	"dockemon/core/commandbuilder"
	"strconv"
)

func GetContainerLogs(containerID string, tail int, hostId ...string) (string, error) {
	cb := commandbuilder.NewCommandBuilder(hostId...)

	output, err := cb.Execute("docker logs --timestamps --tail " + strconv.Itoa(tail) + " " + containerID + " 2>&1")
	if err != nil {
		return "", err
	}

	return output, nil
}
