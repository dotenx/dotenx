package executors

import (
	"gitlab.com/utopiops-water/ao-runner/executors/docker"
	"gitlab.com/utopiops-water/ao-runner/models"
)

type Executor interface {
	Execute(task *models.TaskDetails) *models.TaskResult
}

func NewExecutor() Executor {
	return &docker.DockerExecutor
}
