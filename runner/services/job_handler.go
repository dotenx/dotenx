package services

import (
	"context"
	"fmt"

	"gitlab.com/utopiops-water/ao-runner/executors"
	"gitlab.com/utopiops-water/ao-runner/grpcClient"
	"gitlab.com/utopiops-water/ao-runner/models"
	"gitlab.com/utopiops-water/ao-runner/shared"
)

func HandleJob(client grpcClient.JobStreamServiceClient, task models.Task, logHelper shared.LogHelper) {
	// get the job details
	/*job := models.Job{
		ExecutionId: jobDto.ExecutionId,
		PipelineId:  jobDto.PipelineId,
		ActionId:    -1, // Negative ActionId indicates no action is provided, in this case we also don't (need to) provide the Status
	}

	// get the job details
	taskIds, err := jobService.GetNextJobs(&job)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	fmt.Println("taskIds", taskIds)
	taskChannel, errors := dispatchTasks(taskIds, job.ExecutionId, jobDto.Input, jobService, httpHelper, authHelper)*/
	//resultChannel := make(chan models.TaskResult, )
	//go HanleErrors(jobService, job.ExecutionId, errors)
	//fmt.Println("wait finished")
	/*for res := range resultChannel {
		fmt.Println(res)
		jobService.SetStatus(res.Status, job.ExecutionId, res.Id)
		// todo: send task result for ao api
	}
	if err == nil {
		// todo: ack the message here
		fmt.Println("didn't have error")
	}*/

	// todo: should I NACK? or just leave it and it will get back to the queue?
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
