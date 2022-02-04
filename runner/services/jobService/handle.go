package jobService

import (
	"fmt"

	"github.com/utopiops/automated-ops/runner/config"
	"github.com/utopiops/automated-ops/runner/executors"
	"github.com/utopiops/automated-ops/runner/models"
	"github.com/utopiops/automated-ops/runner/shared"
)

func (manager *JobManager) HandleJob(task models.Task, logHelper shared.LogHelper) {
	//var wg sync.WaitGroup
	executor := executors.NewExecutor()
	result := executor.Execute(&task.Detailes)
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
	manager.LogHelper.Log(result.Log, true, result.Id, result.Id)
	manager.SendResult(resultDto)
	return
}
