package executionService

import (
	"errors"
	"log"
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (manager *executionManager) StartPipeline(input map[string]interface{}, accountId, endpoint string) (interface{}, error) {
	pipelineId, err := manager.Store.GetPipelineIdByEndpoint(noContext, accountId, endpoint)
	if err != nil {
		log.Println(err.Error())
		if err.Error() == "pipeline not found" {
			//return -1, http.StatusBadRequest
			return -1, err
		}
		//return -1, http.StatusInternalServerError
		return -1, err
	}
	pipeline, err := manager.Store.GetById(noContext, pipelineId)
	if pipeline.IsTemplate {
		return -1, errors.New("automation is a template so you can't execute it")
	}
	if err != nil {
		return -1, err
	}
	if !pipeline.IsActive {
		return -1, errors.New("automation is not active")
	}
	hasAccess, err := manager.CheckAccess(accountId, pipelineId)
	if err != nil {
		return -1, err
	}
	if !hasAccess {
		return -1, utils.ErrReachLimitationOfPlan
	}
	execution := models.Execution{
		PipelineVersionId: pipelineId,
		StartedAt:         time.Now(),
		InitialData:       input,
	}

	executionId, err := manager.Store.CreateExecution(noContext, execution)
	if err != nil {
		log.Println(err.Error())
		return -1, err
	}

	pipeline.AccountId = accountId
	// TODO: implementing better error (or timeout) handling
	return manager.ExecuteAllTasksAndReturnResults(pipeline, executionId)
}
