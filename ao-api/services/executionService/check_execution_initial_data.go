package executionService

import (
	"errors"
	"reflect"
)

func (manage *executionManager) CheckExecutionInitialData(executionId int, accountId, source string) (input map[string]interface{}, err error) {
	initialData, err := manage.Store.GetInitialData(noContext, executionId, accountId)
	if err != nil {
		return
	}
	taskData, ok := initialData[source]
	if !ok {
		return nil, errors.New("no initial data for this task")
	}
	var testType map[string]interface{}
	if !reflect.TypeOf(taskData).ConvertibleTo(reflect.TypeOf(testType)) {
		return nil, errors.New("unsuported initial data")
	}
	return taskData.(map[string]interface{}), nil
}

func (manage *executionManager) CheckExecutionInitialDataForWorkSpace(executionId int, accountId string) (workspace string, err error) {
	initialData, err := manage.Store.GetInitialData(noContext, executionId, accountId)
	if err != nil {
		return
	}
	workSpace, ok := initialData["workspace"]
	if !ok {
		return "", errors.New("no workspace for this task")
	}
	return workSpace.(string), nil
}
