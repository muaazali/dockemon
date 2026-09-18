package hosts

const LocalHostID = "localhost"

// HostConfig describes how to reach a remote Docker host over SSH.
type HostConfig struct {
	Address        string
	Port           int
	User           string
	PrivateKeyPath string
}

var registry = map[string]HostConfig{}

func RegisterHost(hostID string, config HostConfig) {
	registry[hostID] = config
}

func GetHost(hostID string) (HostConfig, bool) {
	config, ok := registry[hostID]
	return config, ok
}

func IsLocalHost(hostID string) bool {
	return hostID == "" || hostID == LocalHostID
}
