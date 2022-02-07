package executors

import (
	"github.com/utopiops/automated-ops/runner/executors/docker"
	"github.com/utopiops/automated-ops/runner/models"
)

type Executor interface {
	Execute(task *models.Task) *models.TaskResult
}

func NewExecutor() Executor {
	return &docker.DockerExecutor
}
