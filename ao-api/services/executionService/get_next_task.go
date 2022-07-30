package executionService

import (
	"encoding/json"
	"errors"
	"log"
	"strconv"
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
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
	} else {
		taskIds, err = manager.Store.GetNextTasks(noContext, executionId, taskId, status)
		if err != nil {
			log.Println(err.Error())
			return
		}
	}
	if len(taskIds) == 0 {
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
	}
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
		jobDTO := models.NewJob(task, executionId, accountId)
		workSpace, err := manager.CheckExecutionInitialDataForWorkSpace(executionId)
		if err != nil {
			return err
		}
		jobDTO.WorkSpace = workSpace
		body, err := manager.mapFields(executionId, accountId, task.Name, task.Body)
		if err != nil {
			return err
		}
		jobDTO.Body = body
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

		// convert 'Run mini tasks' to 'Run node code'
		if task.Type == "Run mini tasks" {
			jobDTO.PrepRunMiniTasks()
		}

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
func (manager *executionManager) mapFields(execId int, accountId string, taskName string, taskBody map[string]interface{}) (map[string]map[string]interface{}, error) {
	finalTaskBody := make(map[string]map[string]interface{})
	returnValuesMap, err := manager.getReturnValuesMap(execId, accountId, taskName, taskBody)
	if err != nil {
		return nil, err
	}
	sourceDataArr, err := getSourceDataArray(returnValuesMap)
	if err != nil {
		return nil, err
	}
	for i, currentSourceData := range sourceDataArr {
		inputIndex := strconv.Itoa(i)
		finalTaskBody[inputIndex] = make(map[string]interface{})
		for key, value := range taskBody {
			var insertDt insertDto
			b, _ := json.Marshal(value)
			err := json.Unmarshal(b, &insertDt)
			if err == nil && insertDt.Key != "" && insertDt.Source != "" {
				sourceBody, ok := currentSourceData[insertDt.Source]
				if !ok {
					return nil, errors.New("source Data map does not have a source with key " + insertDt.Source)
				}
				sourceValue, ok := sourceBody[insertDt.Key]
				if !ok {
					return nil, errors.New("source Data map does not have a key " + insertDt.Key + " in source " + insertDt.Source)
				}
				finalTaskBody[inputIndex][key] = sourceValue
			} else {
				finalTaskBody[inputIndex][key] = value
			}
		}
	}
	return finalTaskBody, nil
}

type sourceData map[string]map[string]interface{}

// sourceData map["source"] ==> map["key"] ==> value

type returnValues []map[string]interface{}

// returnvalue[i] ==> map["key"] ==> value

func getSourceDataArray(returnValuesMap map[string]returnValues) ([]sourceData, error) {
	lens := make(map[string]int)
	for sourceName, arr := range returnValuesMap {
		lens[sourceName] = len(arr)
	}
	lensPrime := make(map[string]int)
	counter := 0
	for sourceName, _ := range lens {
		temp := 1
		for j := counter + 1; j < len(lens); j++ {
			key := getKey(j, lens)
			temp *= lens[key]
		}
		lensPrime[sourceName] = temp
		counter += 1
	}
	totalLength := 1
	for _, sourceMap := range returnValuesMap {
		totalLength *= len(sourceMap)
	}
	sourceDataArr := make([]sourceData, 0)
	for i := 0; i < totalLength; i++ {
		sd := sourceData{}
		for sourceName, lenOuts := range lens {
			currentIndex := (i / lensPrime[sourceName]) % lenOuts
			sd[sourceName] = returnValuesMap[sourceName][currentIndex]
		}
		sourceDataArr = append(sourceDataArr, sd)
	}
	return sourceDataArr, nil
}

// check if return values are available for a task and then creates a map from them
func (manager *executionManager) getReturnValuesMap(execId int, accountId, taskName string, taskBody map[string]interface{}) (returnValuesMap map[string]returnValues, err error) {
	returnValuesMap = make(map[string]returnValues)
	for _, value := range taskBody {
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
			returnValueArr, err := getReturnValuesArray(body)
			if err != nil {
				return nil, err
			}
			var ok bool
			for _, returnBody := range returnValueArr {
				if _, ok2 := returnBody[insertDt.Key]; ok2 {
					ok = true
					break
				}
			}
			if !ok {
				log.Println(returnValueArr)
				log.Println(insertDt.Key)
				return nil, errors.New("no value for this field in initial data or return values")
			} else {
				if _, ok := returnValuesMap[insertDt.Source]; !ok {
					returnValuesMap[insertDt.Source] = returnValueArr
				}
			}
		}
	}
	return
}

// getReturnValuesArray returns an array of body outputs
func getReturnValuesArray(body map[string]interface{}) (returnValues []map[string]interface{}, err error) {
	returnValues = make([]map[string]interface{}, 0)
	for _, value := range body {
		var returnValue map[string]interface{}
		b, _ := json.Marshal(value)
		err := json.Unmarshal(b, &returnValue)
		if err != nil {
			return nil, err
		}
		returnValues = append(returnValues, returnValue)
	}
	return
}

func getKey(i int, m map[string]int) string {
	counter := 0
	for key, _ := range m {
		if counter == i {
			return key
		}
		counter += 1
	}
	return ""
}
