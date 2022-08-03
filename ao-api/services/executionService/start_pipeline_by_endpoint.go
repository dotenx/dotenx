package executionService

import (
	"errors"
	"log"
	"strconv"
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/gin-gonic/gin"
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
	// TODO: Properly handle the plans
	// hasAccess, err := manager.CheckAccess(accountId, pipelineId)
	// if err != nil {
	// 	return -1, err
	// }
	// if !hasAccess {
	// 	return -1, errors.New("you have reached your limit")
	// }

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

	err = manager.QueueService.AddUser(pipeline.AccountId)
	if err != nil {
		return -1, err
	}
	err = manager.GetNextTask(-1, executionId, "", pipeline.AccountId)
	if err != nil {
		return -1, err
	}
	if !pipeline.IsInteraction {
		return gin.H{"id": executionId}, err
	}
	return manager.getResponse(executionId)
}
