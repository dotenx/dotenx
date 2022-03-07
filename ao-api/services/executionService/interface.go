package executionService

import (
	"context"

	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/services/queueService"
	"github.com/utopiops/automated-ops/ao-api/stores/pipelineStore"
)

type ExecutionService interface {
	// execution
	GetExecutionGraph(executionId int, accountId string) (interface{}, int)
	GetInitialData(executionId int, accountId string) (models.InputData, int)
	StartPipeline(input map[string]interface{}, accountId, endpoint string) (int, error)
	StartPipelineByName(input map[string]interface{}, accountId, name string) (int, error)
	GetExecution(string) (interface{}, error)
	GetExecutionIdForPipeline(accountId, pipeLineName string) (int, error)

	// tasks
	SetTaskExecutionResult(executionId int, taskId int, taskStatus string) error
	SetTaskExecutionResultDetailes(executionId int, taskId int, status string, returnValue models.ReturnValueMap, log string) error
	GetTaskExecutionResult(executionId int, taskId int) (interface{}, error)
	GetTaskId(executionId int, taskName string) (int, error)
	SetTaskStatusToTimedout(executionId, taskId int) error
	GetNumberOfTasksByExecution(executionId int) (int, error)
	GetNextTask(taskId, executionId int, status, accountId string) error
	GetTaskByExecution(executionId, taskId int) (models.TaskDetails, error)
	GetTasksWithStatusForExecution(id int) ([]models.TaskStatusSummery, error)
}

type executionManager struct {
	Store pipelineStore.PipelineStore
	//QueueService messaging.QueueService
	QueueService queueService.QueueService
	//redisQueue   redis.RDB
}

func NewExecutionService(store pipelineStore.PipelineStore, queue queueService.QueueService) ExecutionService {
	return &executionManager{
		Store:        store,
		QueueService: queue,
		//redisQueue:   rdb,
	}
}

var noContext = context.Background()
