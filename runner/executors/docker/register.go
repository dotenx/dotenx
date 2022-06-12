package docker

import (
	"fmt"

	"github.com/docker/docker/client"
)

func init() {
	RegisterExecutor()
}

func RegisterExecutor() {
	cli, err := client.NewEnvClient()
	if err != nil {
		fmt.Println("Unable to create docker client")
		panic(err)
	}
	DockerExecutor = dockerExecutor{Client: cli}
}
