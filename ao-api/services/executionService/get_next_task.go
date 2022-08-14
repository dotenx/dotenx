package executionService

import (
	"log"
	"strconv"
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
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
		// convert 'Run mini tasks' to 'Run node code'
		if task.Type == "Run mini tasks" {
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
	return nil
}

// check each field in body and looks for value for a filed in a task return value or trigger initial data if needed
func (manager *executionManager) mapFields(execId int, accountId string, taskName string, taskBody map[string]interface{}) (map[string]map[string]interface{}, error) {
	finalTaskBody := make(map[string]map[string]interface{})
	returnValuesMap, err := manager.getReturnValuesMap(execId, accountId, taskName, taskBody)
	if err != nil {
		return nil, err
	}
	//  Cartesian product of returnVlauesMap sources
	sourceDataArr, err := getSourceDataArray(returnValuesMap)
	if err != nil {
		return nil, err
	}
	// for each source we need a task body instance
	for i, currentSourceData := range sourceDataArr {
		inputIndex := strconv.Itoa(i)
		currentTaskBody, err := manager.getBodyFromSourceData(execId, accountId, taskName, taskBody, currentSourceData)
		if err != nil {
			log.Println(err)
			return nil, err
		}
		finalTaskBody[inputIndex] = currentTaskBody
	}
	return finalTaskBody, nil
}
