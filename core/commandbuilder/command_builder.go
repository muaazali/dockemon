package commandbuilder

import (
	"bytes"
	"dockemon/core/hosts"
	"fmt"
	"os"
	"os/exec"
	"runtime"

	"golang.org/x/crypto/ssh"
)

type CommandBuilder struct {
	HostID string
}

func NewCommandBuilder(hostId ...string) *CommandBuilder {
	resolved := hosts.LocalHostID
	if len(hostId) > 0 && hostId[0] != "" {
		resolved = hostId[0]
	}
	return &CommandBuilder{HostID: resolved}
}

func (c *CommandBuilder) Execute(command string) (string, error) {
	if hosts.IsLocalHost(c.HostID) {
		return executeLocal(command)
	}
	return executeRemote(c.HostID, command)
}

func executeLocal(command string) (string, error) {
	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = exec.Command("powershell", "-Command", command)
	} else {
		cmd = exec.Command("sh", "-c", command)
	}

	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return string(output), nil
}

func executeRemote(hostID string, command string) (string, error) {
	hostConfig, ok := hosts.GetHost(hostID)
	if !ok {
		return "", fmt.Errorf("no host configuration found for host %q", hostID)
	}

	key, err := os.ReadFile(hostConfig.PrivateKeyPath)
	if err != nil {
		return "", fmt.Errorf("unable to read private key for host %q: %w", hostID, err)
	}

	signer, err := ssh.ParsePrivateKey(key)
	if err != nil {
		return "", fmt.Errorf("unable to parse private key for host %q: %w", hostID, err)
	}

	clientConfig := &ssh.ClientConfig{
		User: hostConfig.User,
		Auth: []ssh.AuthMethod{
			ssh.PublicKeys(signer),
		},
		// TODO Host key verification is intentionally skipped for now; harden with a known_hosts callback later.
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}

	port := hostConfig.Port
	if port == 0 {
		port = 22
	}

	client, err := ssh.Dial("tcp", fmt.Sprintf("%s:%d", hostConfig.Address, port), clientConfig)
	if err != nil {
		return "", fmt.Errorf("unable to connect to host %q: %w", hostID, err)
	}
	defer client.Close()

	session, err := client.NewSession()
	if err != nil {
		return "", fmt.Errorf("unable to open session on host %q: %w", hostID, err)
	}
	defer session.Close()

	var stdout, stderr bytes.Buffer
	session.Stdout = &stdout
	session.Stderr = &stderr

	if err := session.Run(command); err != nil {
		return "", fmt.Errorf("command failed on host %q: %w: %s", hostID, err, stderr.String())
	}

	return stdout.String(), nil
}
