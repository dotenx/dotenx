package executionService

import (
	"errors"
	"reflect"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (manage *executionManager) CheckExecutionInitialData(executionId int, accountId, source, taskName string) (input map[string]interface{}, err error) {
	initialData, err := manage.Store.GetInitialData(noContext, executionId)
	if err != nil {
		return
	}
	taskData, ok := initialData[source]
	if !ok {
		return nil, errors.New("no initial data for this task")
	}
	if source == config.Configs.App.InteractionBodyKey {
		interactionRunTimeBody := taskData.(map[string]interface{})
		interactionTaskBody, ok := interactionRunTimeBody[taskName]
		if !ok {
			return nil, errors.New("no initial data for this task")
		}
		taskData = interactionTaskBody
	}
	var testType map[string]interface{}
	if !reflect.TypeOf(taskData).ConvertibleTo(reflect.TypeOf(testType)) {
		return nil, errors.New("unsuported initial data")
	}
	return taskData.(map[string]interface{}), nil
}

func (manage *executionManager) CheckExecutionInitialDataForWorkSpace(executionId int) (workspace string, err error) {
	initialData, err := manage.Store.GetInitialData(noContext, executionId)
	if err != nil {
		return
	}
	workSpace, ok := initialData["workspace"]
	if !ok {
		workSpace := utils.GetNewUuid()
		initialData["workspace"] = workSpace
		manage.Store.UpdateInitialData(noContext, executionId, initialData)
		return workSpace, nil
	}
	return workSpace.(string), nil
}
