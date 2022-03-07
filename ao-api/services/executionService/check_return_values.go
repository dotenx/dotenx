package executionService

import (
	"errors"
	"reflect"
)

func (manage *executionManager) CheckReturnValues(executionId int, accountId, taskName string) (input map[string]interface{}, err error) {
	initialData, err := manage.Store.GetInitialData(noContext, executionId, accountId)
	if err != nil {
		return
	}
	taskData, ok := initialData[source]
	if ok {
		return nil, errors.New("no initial data for this task")
	}
	var testType map[string]interface{}
	if !reflect.TypeOf(taskData).ConvertibleTo(reflect.TypeOf(testType)) {
		return nil, errors.New("unsuported initial data")
	}
	return taskData.(map[string]interface{}), nil
}
