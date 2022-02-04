package jobService

import (
	"fmt"

	"github.com/utopiops/automated-ops/runner/config"
	"github.com/utopiops/automated-ops/runner/executors"
	"github.com/utopiops/automated-ops/runner/models"
	"github.com/utopiops/automated-ops/runner/shared"
)

func (manager *JobManager) HandleJob(job models.Job, logHelper shared.LogHelper) {
	executor := executors.NewExecutor()
	taskDetails := models.TaskDetails{
		Name:           "chi bezaram",
		Id:             job.Id,
		Type:           "in type?",
		Body:           job.Data,
		ServiceAccount: "service?",
	}
	result := executor.Execute(&taskDetails)
	fmt.Println(result)
	resultDto := models.TaskStatus{
		ReturnValue: "",
		Result:      models.Status(result.Status),
		Toekn:       config.Configs.Queue.Token,
	}
	if result.Error == nil {
		resultDto.Result = models.StatusCompleted
	} else {
		resultDto.Result = models.StatusFailed
	}
	manager.LogHelper.Log(result.Log, true, result.Id)
	manager.SendResult(job.Id, resultDto)
}
