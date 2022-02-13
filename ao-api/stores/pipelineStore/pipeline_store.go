package pipelineStore

import (
	"context"

	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/models"
)

func New(db *db.DB) PipelineStore {
	return &pipelineStore{db}
}

// NOTE: Many of these endpoints don't get accountId as one of their inputs meaning they don't check if the operation is being performed on the
// jwt token subject's own data or not, this is a BIG VULNERABILITY fix it
type PipelineStore interface {
	GetPipelineVersionId(context context.Context, executionId int) (id int, err error)
	GetTaskByPipelineVersionId(context context.Context, executionId int, taskName string) (id int, err error)
	// Create pipelineStore a new pipeline if `fromVersion` equals to 0 otherwise adds a new pipeline version to an existing pipeline
	Create(context context.Context, base *models.Pipeline, pipeline *models.PipelineVersion) error // todo: return the endpoint
	// Get All pipelines for accountId
	GetPipelines(context context.Context, accountId string) ([]models.Pipeline, error)
	// Retrieve a pipeline version based on version
	GetByVersion(context context.Context, version int16, accountId string, name string) (pipeline models.PipelineVersion, endpoint string, err error)
	// Get the list of the versions of a pipeline by its name
	ListPipelineVersionsByName(context context.Context, accountId string, name string) (pipelines []models.PipelineVersionSummary, err error)
	// Activate specific version of pipeline
	Activate(context context.Context, accountId string, name string, version int16) (err error)
	// Check if the endpoint is valid and activated return the pipeline version id
	GetActivatedPipelineVersionIdByEndpoint(context context.Context, accountId string, endpoint string) (pipelineId int, err error)
	// Check if the name is valid and activated return the pipeline version id
	GetActivatedPipelineVersionIdByName(context context.Context, accountId string, name string) (pipelineId int, err error)
	// Add execution
	CreateExecution(context context.Context, execution models.Execution) (id int, err error)
	// Get initial job of an execution
	GetInitialTask(context context.Context, executionId int) (taskId int, err error)
	// GetInitialData retrieves the initial data of an execution
	GetInitialData(context context.Context, executionId int, accountId string) (InitialData models.InputData, err error)
	// Get next job in an execution based on the status of a task in the execution
	GetNextTasks(context context.Context, executionId int, taskId int, status string) (taskIds []int, err error)
	// Get task details based on execution id and task id
	GetTaskByExecution(context context.Context, executionId int, taskId int) (task models.TaskDetails, err error)
	GetTaskResultDetailes(context context.Context, executionId int, taskId int) (res interface{}, err error)
	// Set the status of a task to timed out if it's status is not already set
	SetTaskStatusToTimedout(context context.Context, executionId int, taskId int) (err error)
	// Set the result of a task
	SetTaskResult(context context.Context, executionId int, taskId int, status string) (err error)
	SetTaskResultDetailes(context context.Context, executionId int, taskId int, status, returnValue, log string) (err error)
	// Retrieve a pipeline version dependency graph based on execution id
	GetExecutionGraph(context context.Context, executionId int, accountId string) (graph models.PipelineVersion, name string, err error)

	/// Workspaces
	// Get all workspace onboarding pipelines
	ListOnBoardingPipelines(context context.Context, accountId string) (pipelines []models.WorkspacePipelineSummary, err error)
	// Get all workspace offboarding pipelines
	ListOffBoardingPipelines(context context.Context, accountId string) (pipelines []models.WorkspacePipelineSummary, err error)
	// Get all the executions corresponding to workspaces (on/off-boarding) pipelines
	ListWorkspaceExecutions(context context.Context, accountId string) (executions []models.WorkspaceExecutionSummary, err error)
}

type pipelineStore struct {
	db *db.DB
}
