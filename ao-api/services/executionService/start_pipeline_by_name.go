package executionService

import (
	"errors"
	"log"
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (manager *executionManager) StartPipelineByName(input map[string]interface{}, accountId, name, tpAccountId, userGroup, projectName string) (interface{}, error) {

	pipelineId, err := manager.Store.GetPipelineId(noContext, accountId, name, projectName)
	if err != nil {
		logrus.Error(err.Error())
		return -1, err
	}
	pipeline, err := manager.Store.GetByName(noContext, accountId, name, projectName)
	if err != nil {
		logrus.Error(err.Error())
		return -1, err
	}
	if pipeline.IsTemplate {
		return -1, errors.New("automation is a template so you can't execute it")
	}
	if !pipeline.IsActive {
		return -1, errors.New("automation is not active")
	}
	hasAccess, err := manager.CheckAccess(accountId, pipelineId)
	if err != nil {
		logrus.Error(err.Error())
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
	if pipeline.IsInteraction {
		execution.ThirdPartyAccountId = tpAccountId
		hasPermission := tpAccountId == ""
		if len(pipeline.UserGroups) > 0 { // ONLY APPLICABLE TO INTERACTION PIPELINES
			for _, ug := range pipeline.UserGroups {
				if ug == userGroup {
					hasPermission = true
					break
				}
			}
		} else { // Having set no user groups for the pipeline means all the user groups have access to the pipeline
			hasPermission = true
		}
		if !hasPermission {
			return -1, errors.New("you don't have permission to execute this interaction")
		}
	}

	executionId, err := manager.Store.CreateExecution(noContext, execution)
	if err != nil {
		log.Println(err.Error())
		return -1, err
	}

	// _ = redis.Execution{
	// 	Action:      "start_pipeline",
	// 	ExecutionId: executionId,
	// 	PipelineId:  pipelineId,
	// 	Input:       input,
	// }

	initialTaskId, err := manager.Store.GetInitialTask(noContext, executionId)
	if err != nil {
		log.Println(err.Error())
		return -1, err
	}
	errChan := make(chan error, 100)
	resultsChan := make(chan models.TaskResultDto, 100)
	defer close(errChan)
	defer close(resultsChan)
	manager.ExecuteTasks(initialTaskId, executionId, accountId, resultsChan, errChan)
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

// transferInitialDataToWrightFormat transforms the initial data from the format that the user provides to the format that the wright service expects
/*
user format:
	{
		"interactionRunTime":{
			"key1" : "value1",
			...
		}
	}
the format we want:
	{
		"interactionRunTime":{
			"input0" :{
				"key1" : "value1",
				...
			}
		}
	}
*/
