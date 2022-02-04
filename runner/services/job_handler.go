package services

import (
	"fmt"

	"github.com/utopiops/automated-ops/runner/models"
	"github.com/utopiops/automated-ops/runner/shared"
)

func HandleJob(task models.Task, logHelper shared.LogHelper) {
	Execute(task, task.ExecutionId, logHelper)
	return
}

func Execute(task models.Task, executionId int, loghelper shared.LogHelper) {
	//var wg sync.WaitGroup
	/*executor := executors.NewExecutor()
	status := &grpcClient.TaskStatus{TaskId: int32(task.Detailes.Id), ExecutionId: int32(task.ExecutionId), Status: models.StatusStarted}
	client.SetTaskStatus(context.Background(), status)
	result := executor.Execute(&task.Detailes)
	fmt.Println(result)
	status = &grpcClient.TaskStatus{TaskId: int32(task.Detailes.Id), ExecutionId: int32(task.ExecutionId), Status: result.Status}
	client.SetTaskStatus(context.Background(), status)
	var errMsg string
	if result.Error == nil {
		errMsg = "no error"
	} else {
		errMsg = result.Error.Error()
	}
	res := &grpcClient.TaskResult{
		TaskId:      int32(task.Detailes.Id),
		ExecutionId: int32(task.ExecutionId),
		Status:      result.Status,
		AccountId:   task.Detailes.AccountId,
		Log:         result.Log,
		Error:       errMsg,
	}
	loghelper.Log(result.Log, true, int(res.ExecutionId), int(res.TaskId))
	client.SubmitTaskResult(context.Background(), res)*/
}

func HanleErrors(jobService *jobService, executionId int, errChan chan int) {
	for e := range errChan {
		fmt.Println("taskId with error", e)
		// Set the status for the task
		jobService.SetStatus(models.StatusFailed, executionId, e)
	}
}
