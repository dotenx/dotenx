package executionService

import (
	"errors"
	"log"
	"strconv"
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

// SPECIFICALLY PUBLIC pipelines
func (manager *executionManager) StartPipelineByEndpoint(input map[string]interface{}, endpoint string) (interface{}, error) {
	pipeline, err := manager.Store.GetPipelineByEndpoint(noContext, endpoint)
	if err != nil {
		log.Println(err.Error())
		if err.Error() == "pipeline not found" {
			return -1, err
		}
		return -1, err
	}
	if !pipeline.IsPublic {
		return -1, errors.New("pipeline is not public")
	}
	if pipeline.IsTemplate {
		return -1, errors.New("pipeline is a template so you can't execute it")
	}
	if err != nil {
		return -1, err
	}
	if !pipeline.IsActive {
		return -1, errors.New("pipeline is not active")
	}
	// TODO: pipeline id isn't important for plan manager and should be deleted from CheckAccess function
	hasAccess, err := manager.CheckAccess(pipeline.AccountId, -1)
	if err != nil {
		return -1, err
	}
	if !hasAccess {
		return -1, utils.ErrReachLimitationOfPlan
	}

	id, _ := strconv.Atoi(pipeline.PipelineDetailes.Id)
	execution := models.Execution{
		PipelineVersionId: id,
		StartedAt:         time.Now(),
		InitialData:       input,
	}

	executionId, err := manager.Store.CreateExecution(noContext, execution)
	if err != nil {
		log.Println(err.Error())
		return -1, err
	}

	// TODO: implementing better error (or timeout) handling
	return manager.ExecuteAllTasksAndReturnResults(pipeline, executionId)
}
