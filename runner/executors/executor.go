package executors

import (
	"github.com/utopiops/automated-ops/runner/executors/docker"
	"github.com/utopiops/automated-ops/runner/models"
)

type Executor interface {
	Execute(task *models.Task) *models.TaskExecutionResult
}

func NewExecutor() Executor {
	return &docker.DockerExecutor
}
