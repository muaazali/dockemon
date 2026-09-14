package models

import "time"

type DockerContainerDataInternal struct {
	ID          string    `json:"Id"`
	RepoTags    []string  `json:"RepoTags"`
	RepoDigests []string  `json:"RepoDigests"`
	Comment     string    `json:"Comment,omitempty"`
	Created     time.Time `json:"Created"`
	Config      struct {
		ExposedPorts struct {
			EightyTCP struct {
			} `json:"80/tcp"`
		} `json:"ExposedPorts"`
		Env        []string `json:"Env"`
		Entrypoint []string `json:"Entrypoint"`
		Cmd        []string `json:"Cmd"`
		WorkingDir string   `json:"WorkingDir"`
		Labels     struct {
			ComDockerComposeProject string `json:"com.docker.compose.project"`
			ComDockerComposeService string `json:"com.docker.compose.service"`
			ComDockerComposeVersion string `json:"com.docker.compose.version"`
			Maintainer              string `json:"maintainer"`
		} `json:"Labels"`
		StopSignal  string `json:"StopSignal"`
		ArgsEscaped bool   `json:"ArgsEscaped"`
	} `json:"Config"`
	Architecture string `json:"Architecture"`
	Os           string `json:"Os"`
	Size         int    `json:"Size"`
	RootFS       struct {
		Type   string   `json:"Type"`
		Layers []string `json:"Layers"`
	} `json:"RootFS"`
	Metadata struct {
		LastTagTime time.Time `json:"LastTagTime"`
	} `json:"Metadata"`
	Descriptor struct {
		MediaType string `json:"mediaType"`
		Digest    string `json:"digest"`
		Size      int    `json:"size"`
	} `json:"Descriptor"`
	Identity struct {
		Build []struct {
			Ref       string    `json:"Ref"`
			CreatedAt time.Time `json:"CreatedAt"`
		} `json:"Build"`
	} `json:"Identity"`
}

type DockerContainerData struct {
	ID					string
	RepoTag				string
	RepoTitle			string
	Comment     		string
	Created     		time.Time
	Size        		int
	ComposeProjectTitle		string
}