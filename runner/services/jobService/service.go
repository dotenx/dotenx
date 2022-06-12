package jobService

import (
	"github.com/dotenx/dotenx/runner/models"
	"github.com/dotenx/dotenx/runner/shared"
)

type JobService interface {
	HandleJob(job models.Job, logHelper shared.LogHelper)
	StartReceiving(jobChan chan models.Job)
	SendResult(jobId string, status models.TaskStatus) error
	SetStatus(jobId string, status models.TaskStatus) error
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
