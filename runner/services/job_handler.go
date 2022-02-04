package services

import (
	"context"
	"fmt"

	"github.com/utopiops/automated-ops/runner/executors"
	"github.com/utopiops/automated-ops/runner/models"
	"github.com/utopiops/automated-ops/runner/shared"
)

func HandleJob(client grpcClient.JobStreamServiceClient, task models.Task, logHelper shared.LogHelper) {
	Execute(task, task.ExecutionId, client, logHelper)
	return
}

func Execute(task models.Task, executionId int, client grpcClient.JobStreamServiceClient, loghelper shared.LogHelper) {
	//var wg sync.WaitGroup
	executor := executors.NewExecutor()
	//for task := range tasks {
	status := &grpcClient.TaskStatus{TaskId: int32(task.Detailes.Id), ExecutionId: int32(task.ExecutionId), Status: models.StatusStarted}
	client.SetTaskStatus(context.Background(), status)
	//jobService.SetStatus(models.StatusStarted, executionId, task.Detailes.Id)
	//fmt.Println("task started", task)
	//	taskCount++
	//time.Sleep(time.Minute * 2)
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
	client.SubmitTaskResult(context.Background(), res)
	//}
	//wg.Wait()
	//close(resultChan)
}

func HanleErrors(jobService *jobService, executionId int, errChan chan int) {
	for e := range errChan {
		fmt.Println("taskId with error", e)
		// Set the status for the task
		jobService.SetStatus(models.StatusFailed, executionId, e)
	}
}
