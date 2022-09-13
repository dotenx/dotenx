package pipelineStore

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func New(db *db.DB) PipelineStore {
	return &pipelineStore{db}
}

// NOTE: Many of these endpoints don't get accountId as one of their inputs meaning they don't check if the operation is being performed on the
// jwt token subject's own data or not, this is a BIG VULNERABILITY fix it
type PipelineStore interface {
	// pipelines
	GetById(context context.Context, id int) (pipeline models.PipelineSummery, err error)
	DeleteExecution(context context.Context, id int) (err error)
	DeletePipeline(context context.Context, accountId, name string) (err error)
	GetPipelineId(context context.Context, accountId, name, projectId string) (id int, err error)
	GetPipelineIdByExecution(context context.Context, executionId int) (id int, err error)
	GetAllTemplateChildren(context context.Context, accountId, project, name string) (pipelines []models.Pipeline, err error)
	// Create pipelineStore a new pipeline
	Create(context context.Context, base *models.Pipeline, pipeline *models.PipelineVersion, isTemplate bool, isInteraction bool, projectName string, parent_id int, createdFor string) error // todo: return the endpoint
	// Get All pipelines for accountId
	GetPipelines(context context.Context, accountId string) ([]models.Pipeline, error)
	// Get All pipelines of a project in the account
	ListProjectPipelines(context context.Context, accountId, projectName string) ([]models.Pipeline, error)
	// Retrieve a pipeline based on name
	GetByName(context context.Context, accountId string, name, project_name string) (pipeline models.PipelineSummery, err error)
	// Retrieve a pipeline based on endpoint
	GetPipelineByEndpoint(context context.Context, endpoint string) (pipeline models.PipelineSummery, err error)
	// Check if the endpoint is valid return the pipeline id
	// TODO: should not use accountId, endpoint is enough
	GetPipelineIdByEndpoint(context context.Context, accountId string, endpoint string) (int, error)
	GetPipelineNameById(context context.Context, accountId string, pipelineId int) (pipelineName string, err error)

	// Set the access of an interaction to public or private (true or false)
	SetInteractionAccess(pipelineId string, isPublic bool) (err error)
	// Set the user groups allowed to access an interaction
	SetUserGroups(pipelineId string, userGroups []string) (err error)

	// tasks
	GetNumberOfTasksForPipeline(context context.Context, pipelineId int) (count int, err error)
	GetTaskByPipelineId(context context.Context, pipelineVersionId int, taskName string) (id int, err error)
	GetTasksWithStatusForExecution(noContext context.Context, executionId int) ([]models.TaskStatusSummery, error)
	GetTaskNameById(noContext context.Context, taskId int) (string, error)
	// Get task details based on execution id and task id
	GetTaskByExecution(context context.Context, executionId int, taskId int) (task models.TaskDetails, err error)
	GetTaskResultDetails(context context.Context, executionId int, taskId int) (res interface{}, err error)
	// Set the status of a task to timed out if it's status is not already set
	SetTaskStatusToTimedout(context context.Context, executionId int, taskId int) (err error)
	// Set the result of a task
	SetTaskResult(context context.Context, executionId int, taskId int, status string) (err error)
	SetTaskResultDetails(context context.Context, executionId int, taskId int, status string, returnValue models.ReturnValueMap, log string) (err error)

	// executions
	GetNumberOfExecutions(context context.Context, pipelineId int) (id int, err error)
	GetAllExecutions(context context.Context, pipelineId int) ([]models.Execution, error)
	GetLastExecution(context context.Context, pipelineId int) (id int, err error)
	GetExecutionDetailes(context context.Context, executionId int) (models.Execution, error)
	SetExecutionTime(executionId, seconds int) error
	// Add execution
	CreateExecution(context context.Context, execution models.Execution) (id int, err error)
	GetThirdPartyAccountId(context context.Context, executionId int) (string, error)
	// Get initial job of an execution
	GetInitialTask(context context.Context, executionId int) (taskId int, err error)
	// GetInitialData retrieves the initial data of an execution
	GetInitialData(context context.Context, executionId int) (InitialData models.InputData, err error)
	UpdateInitialData(context context.Context, execId int, initialData models.InputData) error
	// Get next job in an execution based on the status of a task in the execution
	GetNextTasks(context context.Context, executionId int, taskId int, status string) (taskIds []int, err error)

	ActivatePipeline(context context.Context, accountId, pipelineId string) error
	DeActivatePipeline(context context.Context, accountId, pipelineId string) error

	GetAccountIdByExecutionId(context context.Context, executionId int) (string, error)

	// Deletes all the pipelines in the project
	DeleteAllPipelines(context context.Context, accountId, projectName string) (err error)
}

type pipelineStore struct {
	db *db.DB
}
