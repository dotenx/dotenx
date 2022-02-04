package jobService

import (
	"github.com/utopiops/automated-ops/runner/models"
	"github.com/utopiops/automated-ops/runner/shared"
)

type JobService interface {
	HandleJob(task models.Task, logHelper shared.LogHelper)
	StartReceiving(clientId string, taskChan chan models.Task)
	SendResult(status models.TaskStatus) error
}

type JobManager struct {
	HttpHelper shared.HttpHelper
	LogHelper  shared.LogHelper
}

func NewService(httpHelper shared.HttpHelper, logHelper shared.LogHelper) JobService {
	return &JobManager{
		HttpHelper: httpHelper,
		LogHelper:  logHelper,
	}
}
