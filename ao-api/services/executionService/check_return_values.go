package executionService

import (
	"encoding/json"

	"github.com/utopiops/automated-ops/ao-api/models"
)

func (manage *executionManager) CheckReturnValues(executionId int, accountId, taskName string) (input map[string]interface{}, err error) {
	taskId, err := manage.GetTaskId(executionId, taskName)
	if err != nil {
		return nil, err
	}
	res, err := manage.Store.GetTaskResultDetailes(noContext, executionId, taskId)
	if err != nil {
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
