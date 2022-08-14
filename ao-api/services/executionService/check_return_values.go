package executionService

import (
	"encoding/json"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (manage *executionManager) CheckReturnValues(executionId int, accountId, taskName string) (input map[string]interface{}, err error) {
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
	return result.ReturnValue, nil
}
