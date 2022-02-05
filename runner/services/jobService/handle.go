package jobService

import (
	"fmt"
	"log"

	"github.com/utopiops/automated-ops/runner/config"
	"github.com/utopiops/automated-ops/runner/executors"
	"github.com/utopiops/automated-ops/runner/models"
	"github.com/utopiops/automated-ops/runner/shared"
)

func (manager *JobManager) HandleJob(job models.Job, logHelper shared.LogHelper) {
	executor := executors.NewExecutor()
	var name, taskType string
	var body map[string]interface{}
	if _, ok := job.Data["name"]; ok {
		name = job.Data["name"].(string)
	}
	if _, ok := job.Data["type"]; ok {
		taskType = job.Data["type"].(string)
	}
	if _, ok := job.Data["body"]; ok {
		body = job.Data["body"].(map[string]interface{})
	}
	taskDetails := models.TaskDetails{
		Name:           name,
		Id:             job.Id,
		Type:           taskType,
		Body:           body,
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
	log.Println(resultDto)
	manager.SendResult(job.Id, resultDto)
}
