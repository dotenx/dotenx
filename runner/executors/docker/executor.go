package docker

import "github.com/docker/docker/client"

type dockerExecutor struct {
	Client *client.Client
}

var DockerExecutor dockerExecutor
