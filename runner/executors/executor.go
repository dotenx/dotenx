package executors

import (
	"github.com/dotenx/dotenx/runner/executors/awsLambda"
	"github.com/dotenx/dotenx/runner/models"
)

type Executor interface {
	Execute(task *models.Task) *models.TaskExecutionResult
}

func NewExecutor() Executor {
	return &awsLambda.LambdaExecutor
}
