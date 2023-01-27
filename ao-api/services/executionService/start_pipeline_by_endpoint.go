package executionService

import (
	"errors"
	"log"
	"strconv"
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
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

	initialTaskId, err := manager.Store.GetInitialTask(noContext, executionId)
	if err != nil {
		log.Println(err.Error())
		return -1, err
	}
	errChan := make(chan error, 100)
	resultsChan := make(chan models.TaskResultDto, 100)
	defer close(errChan)
	defer close(resultsChan)
	manager.ExecuteTasks(initialTaskId, executionId, pipeline.AccountId, resultsChan, errChan)
	for {
		select {
		case <-time.After(20 * time.Second):
			return -1, errors.New("pipeline timeout")
		case err = <-errChan:
			return -1, err
		case res := <-resultsChan:
			cnt, err := manager.Store.GetNumberOfRunningTasks(noContext, executionId)
			if err != nil {
				return -1, err
			}
			taskIds, err := manager.Store.GetNextTasks(noContext, executionId, res.TaskId, res.Status)
			if err != nil {
				return -1, err
			}
			if cnt == 0 && len(taskIds) == 0 {
				if !pipeline.IsInteraction {
					return gin.H{"id": executionId}, err
				}
				var taskRes = struct {
					Status      string                `json:"status"`
					Error       string                `json:"error"`
					Log         string                `json:"log"`
					ReturnValue models.ReturnValueMap `json:"return_value"`
				}{
					Status:      res.Status,
					Error:       res.Error,
					Log:         res.Log,
					ReturnValue: res.ReturnValue,
				}
				return taskRes, nil
			}
		}
	}
}
