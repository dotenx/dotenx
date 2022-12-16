package executionService

import (
	"encoding/json"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

// CheckReturnValues is a function that checks the return values of the execution and returns the outputs array
/*
format in the return values:{
	"status": "completed",
	"log": "log string",
	"return_value":{
		"outputs": [
			{
				"key1": "field1",
				"key2": "field2"
			},
			{
				"key1": "field3",
				"key2": "field4"
			}
		]
	}
}
output format:[
		{
			"key1": "field1",
			"key2": "field2"
		},
		{
			"key1": "field3",
			"key2": "field4"
		}
]
*/
func (manage *executionManager) CheckReturnValues(executionId int, accountId, taskName string) (inputs interface{}, err error) {
	taskId, err := manage.GetTaskId(executionId, taskName)
	if err != nil {
		logrus.Println(err.Error() + " in getting task id for exec " + fmt.Sprintf("%d", executionId) + " and task " + taskName)
		return nil, err
	}
	res, err := manage.Store.GetTaskResultDetails(noContext, executionId, taskId)
	if err != nil {
		logrus.Println(err)
		return
	}
	type taskRes struct {
		Status      string                `json:"status"`
		Log         string                `json:"log"`
		ReturnValue models.ReturnValueMap `json:"return_value"`
	}
	var result taskRes
	bytes, err := json.Marshal(res)
	if err != nil {
		return
	}
	json.Unmarshal(bytes, &result)
	outputs := result.ReturnValue["outputs"]
	// var testType []interface{}
	// if !reflect.TypeOf(outputs).ConvertibleTo(reflect.TypeOf(testType)) {
	// 	return nil, errors.New("unsuported initial data")
	// }
	// finalRes := make(map[string]interface{})
	// for _, output := range outputs.([]interface{}) {
	// 	finalRes = append(finalRes, output.(map[string]interface{}))
	// }
	return outputs, nil
}
