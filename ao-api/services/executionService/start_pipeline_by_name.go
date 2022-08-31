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

/*	Note: based on this implementation always the latest activated version will be executed. If you want to
	execute specific version you need to get the version as another parameter and feed it to the GetActivatedPipelineVersionIdByEndpoint
	but you would let people to execute inactive versions (current assumption is there is only one active version at any given time).
	Current approach doesn't match the cases like the build pipelines in repositories where you have particular pipeline per git push
	and at any time you are able to re-run it.
*/
func (manager *executionManager) StartPipelineByName(input map[string]interface{}, accountId, name, tpAccountId, userGroup string) (interface{}, error) {

	pipelineId, err := manager.Store.GetPipelineId(noContext, accountId, name)
	if err != nil {
		logrus.Error(err.Error())
		return -1, err
	}
	pipeline, err := manager.Store.GetByName(noContext, accountId, name)
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
		hasPermission := false
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

	//err = manager.redisQueue.StoreExecution(msg, accountId)
	if err != nil {
		manager.DeleteExecution(executionId)
		return -1, err
	}
	err = manager.QueueService.AddUser(accountId)
	if err != nil {
		manager.DeleteExecution(executionId)
		return -1, err
	}
	err = manager.GetNextTask(-1, executionId, "", accountId)
	if err != nil {
		//manager.DeleteExecution(executionId)
		return -1, err
	} // ch, err := manager.QueueService.NewChannel()
	// if err != nil {
	// 	log.Println(err.Error())
	// 	return -1, http.StatusInternalServerError
	// }

	// err = manager.QueueService.SendMessage(ch, msg, config.Configs.Queue.Exchange, config.Configs.Queue.Key)
	// if err != nil {
	// 	log.Println(err.Error())
	// 	return -1, http.StatusInternalServerError
	// }
	if !pipeline.IsInteraction {
		return gin.H{"id": executionId}, err
	}
	return manager.getResponse(executionId)
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
