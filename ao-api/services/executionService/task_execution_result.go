package executionService

import (
	"log"

	"github.com/utopiops/automated-ops/ao-api/models"
)

func (manager *executionManager) SetTaskExecutionResult(executionId int, taskId int, taskStatus string) error {
	err := manager.Store.SetTaskResult(noContext, executionId, taskId, taskStatus)
	if err != nil {
		log.Println(err.Error())
		return err
	}
	return nil
}
func (manager *executionManager) SetTaskExecutionResultDetailes(executionId int, taskId int, taskStatus string, returnValue models.ReturnValueMap, logs string) error {
	err := manager.Store.SetTaskResultDetailes(noContext, executionId, taskId, taskStatus, returnValue, logs)
	if err != nil {
		log.Println(err.Error())
		return err
	}
	if taskStatus == models.Completed.String() {
		//save the returned value in initial data
	}
	return nil
}

func (manager *executionManager) GetTaskExecutionResult(executionId int, taskId int) (interface{}, error) {
	res, err := manager.Store.GetTaskResultDetailes(noContext, executionId, taskId)
	if err != nil {
		log.Println(err.Error())
		// if err.Error() == "Foreign key constraint violence" {
		// 	return http.StatusBadRequest, gin.H{"error": "Execution/Task doesn't exist"}
		// }
		// // TODO: This stops the pipeline, mark the pipeline as broken or whatever makes sense
		// return http.StatusInternalServerError, nil
		return nil, err
	}

	// msg := services.TaskResultQueueMessage{
	// 	Action:      "task_result",
	// 	ExecutionId: executionId,
	// 	TaskId:      taskId,
	// 	Status:      taskStatus,
	// 	Result:      taskResult,
	// }

	// ch, err := manager.QueueService.NewChannel()
	// if err != nil {
	// 	// TODO: This stops the pipeline, mark the pipeline as broken or whatever makes sense
	// 	return http.StatusInternalServerError, nil
	// }

	// err = manager.QueueService.SendMessage(ch, msg, config.Configs.Queue.Exchange, config.Configs.Queue.Key)
	// if err != nil {
	// 	return http.StatusInternalServerError, nil
	// }
	return res, nil
}
