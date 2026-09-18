package hosts

import (
	"dockemon/core/models"
	"encoding/json"
	"log"
	"os"
	"path/filepath"
	"sync"
)

const LocalHostID = "localhost"

var (
	mu       sync.Mutex
	loadOnce sync.Once
	registry = map[string]models.Host{}
)

func hostsFilePath() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	dir := filepath.Join(configDir, "dockemon")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", err
	}
	return filepath.Join(dir, "hosts.json"), nil
}

// load reads previously saved hosts from disk into the in-memory registry. It
// runs at most once, lazily, on first access.
func load() {
	path, err := hostsFilePath()
	if err != nil {
		log.Println("Unable to resolve hosts file path:", err.Error())
		return
	}

	data, err := os.ReadFile(path)
	if err != nil {
		if !os.IsNotExist(err) {
			log.Println("Unable to read hosts file:", err.Error())
		}
		return
	}

	var saved []models.Host
	if err := json.Unmarshal(data, &saved); err != nil {
		log.Println("Unable to parse hosts file:", err.Error())
		return
	}

	for _, host := range saved {
		registry[host.ID] = host
	}
}

func persist() error {
	path, err := hostsFilePath()
	if err != nil {
		return err
	}

	list := make([]models.Host, 0, len(registry))
	for _, host := range registry {
		list = append(list, host)
	}

	data, err := json.MarshalIndent(list, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0o644)
}

func RegisterHost(host models.Host) error {
	loadOnce.Do(load)

	mu.Lock()
	defer mu.Unlock()

	registry[host.ID] = host
	return persist()
}

func GetHost(hostID string) (models.Host, bool) {
	loadOnce.Do(load)

	mu.Lock()
	defer mu.Unlock()

	host, ok := registry[hostID]
	return host, ok
}

// ListHosts returns every saved host, always including a synthetic entry for
// the local machine even if it was never explicitly registered.
func ListHosts() []models.Host {
	loadOnce.Do(load)

	mu.Lock()
	defer mu.Unlock()

	list := make([]models.Host, 0, len(registry)+1)
	if _, ok := registry[LocalHostID]; !ok {
		list = append(list, models.Host{ID: LocalHostID, Name: "Local"})
	}
	for _, host := range registry {
		list = append(list, host)
	}
	return list
}

func IsLocalHost(hostID string) bool {
	return hostID == "" || hostID == LocalHostID
}
