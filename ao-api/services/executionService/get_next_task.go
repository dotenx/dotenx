package executionService

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
)

// start first task (initial task) if you call this method wih task id <= 0,
// otherwise start the tasks which will be triggerd if given task id go to given status
func (manager *executionManager) GetNextTask(taskId, executionId int, status, accountId string) (err error) {
	executionDetailes, err := manager.Store.GetExecutionDetailes(noContext, executionId)
	if err != nil {
		return
	}
	if executionDetailes.IsExecutionDone {
		return nil
	}
	taskIds := make([]int, 0)
	if taskId <= 0 {
		taskId, err = manager.Store.GetInitialTask(noContext, executionId)
		if err != nil {
			log.Println(err.Error())
			return
		}
		taskIds = append(taskIds, taskId)
	} else {
		taskIds, err = manager.Store.GetNextTasks(noContext, executionId, taskId, status)
		if err != nil {
			log.Println(err.Error())
			return
		}
	}
	/*if len(taskIds) == 0 {
		numberOftasks, err := manager.GetNumberOfTasksByExecution(executionId)
		if err != nil {
			log.Println(err)
			return err
		}
		summeries, err := manager.GetTasksWithStatusForExecution(executionId)
		if err != nil {
			log.Println(err)
			return err
		}
		if manager.IsExecutionDone(numberOftasks, summeries) {
			exec, err := manager.GetExecutionDetails(executionId)
			if err != nil {
				log.Println(err)
				return err
			}
			err = manager.SetExecutionTime(executionId, int(time.Now().Unix())-int(exec.StartedAt.Unix()))
			if err != nil {
				log.Println(err)
				return err
			}
		}
		return nil
	}*/
	tpAccountId, err := manager.Store.GetThirdPartyAccountId(noContext, executionId)
	if err != nil {
		log.Println(err.Error())
		return
	}
	for _, taskId := range taskIds {
		task, err := manager.Store.GetTaskByExecution(noContext, executionId, taskId)
		if err != nil {
			return err
		}
		if task.Type == "interaction_response" {
			log.Println(manager.InteractionsResponseChannels)
			chann := manager.InteractionsResponseChannels[executionId]
			if chann == nil {
				return errors.New("no channel for this execution")
			}
			manager.InteractionsResponseChannels[executionId] <- manager.getInteractionResponse(executionId, accountId, task)
			err = manager.Store.SetExecutionDone(noContext, executionId)
			if err != nil {
				return err
			}
			err = manager.SetExecutionTime(executionId, int(time.Now().Unix())-int(executionDetailes.StartedAt.Unix()))
			return err
		}
		jobDTO := models.NewJob(task, executionId, accountId)
		workSpace, err := manager.CheckExecutionInitialDataForWorkSpace(executionId)
		if err != nil {
			return err
		}
		jobDTO.WorkSpace = workSpace
		if task.Integration != "" {
			integration, err := manager.IntegrationService.GetIntegrationByName(accountId, task.Integration)
			if err != nil {
				return err
			}
			jobDTO.SetIntegration(integration)
		} else {
			if tpAccountId == "" {
				log.Println("task does not have an integration")
			} else {
				// TODO what if for tasks with several types of integrations
				task.MetaData = models.AvaliableTasks[task.Type]
				if len(task.MetaData.Integrations) > 0 {
					integration, err := manager.IntegrationService.GetIntegrationForThirdPartyAccount(accountId, tpAccountId, task.MetaData.Integrations[0])
					if err != nil {
						return err
					}
					jobDTO.SetIntegration(integration)
				}
			}
		}
		body, err := manager.mapFields(executionId, accountId, task.Name, task.Type, jobDTO.Body)
		if err != nil {
			return err
		}

		jobDTO.Body = body
		if task.Type == "Run node code" {
			jobDTO.SetRunCodeFields()
		}
		err = manager.QueueService.QueueTasks(accountId, "default", jobDTO)
		if err != nil {
			log.Println(err.Error())
			return err
		}
		manager.UtopiopsService.IncrementUsedTimes(models.AvaliableTasks[task.Type].Author, "task", task.Type)
	}
	return nil
}

type insertDto struct {
	Source string `json:"source"`
	Key    string `json:"key"`
}

// check each field in body and looks for value for a filed in a task return value or trigger initial data if needed
func (manager *executionManager) mapFields(execId int, accountId string, taskName string, taksType string, taskBody map[string]interface{}) (map[string]interface{}, error) {
	for key, value := range taskBody {
		var insertDt insertDto
		b, _ := json.Marshal(value)
		err := json.Unmarshal(b, &insertDt)
		if err == nil && insertDt.Key != "" && insertDt.Source != "" {
			body, err := manager.CheckExecutionInitialData(execId, accountId, insertDt.Source, taskName)
			if err != nil {
				body, err = manager.CheckReturnValues(execId, accountId, insertDt.Source)
				if err != nil {
					log.Println(err)
					return nil, errors.New("no value for this field in initial data or return values")
				}
			}
			if _, ok := body[insertDt.Key]; !ok {
				log.Println(err)
				return nil, errors.New("no value for this field in initial data or return values")
			}
			taskBody[key] = body[insertDt.Key]
		}
	}
	return taskBody, nil
}

func (manager *executionManager) getInteractionResponse(executionId int, accountId string, task models.TaskDetails) (response models.InteractionResponse) {
	response = models.InteractionResponse{}
	StatusCode := task.Body["statusCode"].(string)
	stausCodeInt, err := strconv.Atoi(StatusCode)
	if err != nil {
		response.Error = err.Error()
		return
	}
	responseBody := make(map[string]map[string]interface{})
	response.StatusCode = stausCodeInt
	body := task.Body["body"].(map[string]interface{})
	for taskName, fields := range body {
		returnValues, err := manager.CheckReturnValues(executionId, accountId, taskName)
		if err != nil {
			response.Error = err.Error()
			return
		}
		fieldsArr := fields.([]interface{})
		for _, field := range fieldsArr {
			fieldStr := fmt.Sprintf("%v", field)
			if _, ok := returnValues[fieldStr]; !ok {
				response.Error = "no value for field" + fieldStr + "in return values"
				return
			}
			if responseBody[taskName] == nil {
				responseBody[taskName] = make(map[string]interface{})
			}
			responseBody[taskName][fieldStr] = returnValues[fieldStr]
		}
	}
	response.Body = responseBody
	return
}
