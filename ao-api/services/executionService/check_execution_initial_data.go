package executionService

import (
	"errors"
	"reflect"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

func (manage *executionManager) CheckExecutionInitialData(executionId int, accountId, source, taskName string) (inputs []map[string]interface{}, err error) {
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
		taskData = []interface{}{interactionTaskBody}
	}
	var testType []interface{}
	if !reflect.TypeOf(taskData).ConvertibleTo(reflect.TypeOf(testType)) {
		return nil, errors.New("unsuported initial data")
	}
	res := make([]map[string]interface{}, 0)
	for _, v := range taskData.([]interface{}) {
		res = append(res, v.(map[string]interface{}))
	}
	return res, nil
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
