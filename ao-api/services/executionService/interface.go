package executionService

import (
	"context"

	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/services/queueService"
	"github.com/utopiops/automated-ops/ao-api/stores/pipelineStore"
)

type ExecutionService interface {
	GetExecutionGraph(executionId int, accountId string) (interface{}, int)
	GetInitialData(executionId int, accountId string) (models.InputData, int)
	GetNextTask(taskId, executionId int, status, accountId string) error
	GetTaskByExecution(executionId, taskId int) (models.TaskDetails, error)
	StartPipeline(input map[string]interface{}, accountId, endpoint string) (int, error)
	StartPipelineByName(input map[string]interface{}, accountId, name string) (int, error)
	SetTaskExecutionResult(executionId int, taskId int, taskStatus string, taskResult map[string]interface{}) error
	SetTaskExecutionResultDetailes(executionId int, taskId int, status, returnValue, log string) error
	GetTaskExecutionResult(executionId int, taskId int) (interface{}, error)
	SetTaskStatusToTimedout(executionId, taskId int) error
	GetExecution(string) (interface{}, error)
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
