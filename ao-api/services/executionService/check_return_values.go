package executionService

import (
	"encoding/json"
	"log"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (manage *executionManager) CheckReturnValues(executionId int, accountId, taskName string) (input map[string]interface{}, err error) {
	taskId, err := manage.GetTaskId(executionId, taskName)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	res, err := manage.Store.GetTaskResultDetails(noContext, executionId, taskId)
	if err != nil {
		log.Println(err)
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
	return result.ReturnValue, nil
}
