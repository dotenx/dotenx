package jobService

import (
	"fmt"

	"github.com/utopiops/automated-ops/runner/executors"
	"github.com/utopiops/automated-ops/runner/models"
	"github.com/utopiops/automated-ops/runner/shared"
)

func (manager *JobManager) HandleJob(job models.Job, logHelper shared.LogHelper) {
	executor := executors.NewExecutor()
	if !job.Validate() {
		fmt.Println("invalid job body")
		resultDto := models.TaskStatus{
			ReturnValue: "",
			Result:      models.StatusFailed,
			Toekn:       job.Token,
		}
		err := manager.SendResult(job.Id, resultDto)
		if err != nil {
			fmt.Printf("error in setting job result: %s\n", err.Error())
		}
		return
	}
	taskDetails := models.TaskDetails{
		Name:           job.Data["name"].(string),
		Type:           job.Data["type"].(string),
		Body:           job.Data["body"].(map[string]interface{}),
		ServiceAccount: "serviceAccount?",
		Timeout:        int(job.Data["timeout"].(float64)),
	}
	result := executor.Execute(executors.ProcessTask(&taskDetails))
	fmt.Println(result)
	resultDto := models.TaskStatus{
		ReturnValue: result.Log,
		Result:      models.Status(result.Status),
		Toekn:       job.Token,
	}
	//var err error
	//var id string
	fmt.Println("job log:")
	fmt.Println(result.Log)
	fmt.Println("################################")
	if result.Error == nil {
		resultDto.Result = models.StatusCompleted
		//id, err = manager.LogHelper.Log("log: "+result.Log, true, result.Id)
	} else {
		//id, err = manager.LogHelper.Log("error: "+result.Error.Error()+", log: "+result.Log, true, result.Id)
		resultDto.Result = models.StatusFailed
	}
	/*if err != nil {
		fmt.Printf("error in setting job log: %s\n", err.Error())
	} else {
		fmt.Println("jobId: " + id)
	}*/
	err := manager.SendResult(job.Id, resultDto)
	if err != nil {
		fmt.Printf("error in setting job result: %s\n", err.Error())
	}
}
