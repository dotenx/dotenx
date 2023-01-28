package executionService

import (
	"errors"
	"log"
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
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

	pipeline.AccountId = accountId
	// TODO: implementing better error (or timeout) handling
	return manager.ExecuteAllTasksAndReturnResults(pipeline, executionId)
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
