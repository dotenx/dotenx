package executionService

import (
	"bytes"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

// start first task (initial task) if you call this method wih task id <= 0,
// otherwise start the tasks which will be triggerd if given task id go to given status
func (manager *executionManager) GetNextTask(taskId, executionId int, status, accountId string) (err error) {
	taskIds := make([]int, 0)
	if taskId <= 0 {
		taskId, err = manager.Store.GetInitialTask(noContext, executionId)
		if err != nil {
			log.Println(err.Error())
			return
		}
		taskIds = append(taskIds, taskId)
	} else { // query database to get next taskIds to be triggered
		taskIds, err = manager.Store.GetNextTasks(noContext, executionId, taskId, status)
		if err != nil {
			log.Println(err.Error())
			return
		}
	}
	if len(taskIds) == 0 { // automation is done and we have to set the execution time and some other things
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
	} // tpAccountId will be used to get user integration for each task (if needed)
	tpAccountId, err := manager.Store.GetThirdPartyAccountId(noContext, executionId)
	if err != nil {
		log.Println(err.Error())
		return
	}
	for _, taskId := range taskIds {
		// getting task body from db
		task, err := manager.Store.GetTaskByExecution(noContext, executionId, taskId)
		if err != nil {
			return err
		}
		// create job based on task detailes
		jobDTO := models.NewJob(task, executionId, accountId)
		workSpace, err := manager.CheckExecutionInitialDataForWorkSpace(executionId)
		if err != nil {
			return err
		}
		jobDTO.WorkSpace = workSpace
		// set job body based on task body and execution initial data and other tasks output (if needed)
		body, err := manager.mapFields(executionId, accountId, task.Name, task.Body)
		if err != nil {
			return err
		}
		jobDTO.Body = body
		// adding dynamic values to job metadata for runner to use them in the proccess step
		if jobDTO.MetaData.HasDynamicVariables {
			jobDTO.AddDynamicValuesToMetaData()
		}
		if task.Integration != "" { // setting integration if task has integration directly
			integration, err := manager.IntegrationService.GetIntegrationByName(accountId, task.Integration)
			if err != nil {
				return err
			}
			jobDTO.SetIntegration(integration)
		} else {
			if tpAccountId == "" {
				logrus.Println("task does not have an integration")
			} else {
				// TODO what if for tasks with several types of integrations
				task.MetaData = models.AvaliableTasks[task.Type]
				if len(jobDTO.MetaData.Integrations) > 0 { // check if task needs integration
					logrus.Println(task.MetaData.Integrations[0] + " || " + accountId + " || " + tpAccountId)
					integration, err := manager.IntegrationService.GetIntegrationForThirdPartyAccount(accountId, tpAccountId, task.MetaData.Integrations[0])
					if err != nil {
						return err
					}
					logrus.Println(integration)
					jobDTO.SetIntegration(integration)
				}
			}
		}
		// convert 'Custom task' to 'Run node code'
		if task.Type == "Custom task" {
			jobDTO.PrepRunMiniTasks()
		}
		if task.Type == "Run node code" {
			jobDTO.SetRunCodeFields()
		}
		// adding job to queue
		err = manager.QueueService.QueueTasks(accountId, "default", jobDTO)
		if err != nil {
			log.Println(err.Error())
			return err
		}
		manager.UtopiopsService.IncrementUsedTimes(models.AvaliableTasks[task.Type].Author, "task", task.Type)
	}
	err = manager.updateExecutionTasksUsage(accountId, len(taskIds))
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	return nil
}

// check each field in body and looks for value for a filed in a task return value or trigger initial data if needed
func (manager *executionManager) mapFields(execId int, accountId string, taskName string, taskBody map[string]interface{}) (map[string]interface{}, error) {
	// finalTaskBody := make([]map[string]interface{}, 0)
	// returnValuesMap, err := manager.getReturnValuesMap(execId, accountId, taskName, taskBody)
	// if err != nil {
	// 	return nil, err
	// }
	// fmt.Println("###################################################### return value map:")
	// fmt.Println(returnValuesMap)
	// fmt.Println("######################################################")
	//  Cartesian product of returnVlauesMap sources
	// sourceDataArr, err := getSourceDataArray(returnValuesMap)
	// if err != nil {
	// 	return nil, err
	// }
	// fmt.Println("###################################################### source data arr")
	// fmt.Println(sourceDataArr)
	// fmt.Println("######################################################")
	// for each source we need a task body instance
	// for _, currentSourceData := range sourceDataArr {
	finalTaskBody, err := manager.getBodyFromSourceData(execId, accountId, taskName, taskBody, map[string]returnValues{})
	if err != nil {
		log.Println(err)
		return nil, err
	}
	// finalTaskBody = append(finalTaskBody, currentTaskBody)
	// }
	logrus.Info("finalTaskBody:", finalTaskBody)
	return finalTaskBody, nil
}

// updateExecutionTasksUsage sends a request to dotenx-admin and add number of tasks to account's plan usage
func (manager *executionManager) updateExecutionTasksUsage(accountId string, tasks int) error {
	dt := executionTaskDto{
		AccountId: accountId,
		Tasks:     tasks,
	}
	jsonData, err := json.Marshal(dt)
	if err != nil {
		return errors.New("bad input body")
	}
	requestBody := bytes.NewBuffer(jsonData)
	token, err := utils.GeneratToken()
	if err != nil {
		return err
	}
	Requestheaders := []utils.Header{
		{
			Key:   "Authorization",
			Value: token,
		},
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
	}
	url := config.Configs.Endpoints.Admin + "/internal/execution/task"
	httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
	_, err, status, _ := httpHelper.HttpRequest(http.MethodPost, url, requestBody, Requestheaders, time.Minute, true)
	if err != nil {
		return err
	}
	if status != http.StatusOK && status != http.StatusAccepted {
		logrus.Println("status code:", status)
		return errors.New("not ok with status: " + strconv.Itoa(status))
	}
	return nil
}

type executionTaskDto struct {
	AccountId string `json:"account_id" binding:"required"`
	Tasks     int    `json:"tasks" binding:"required"`
}
