package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/utopiops/automated-ops/runner/config"
	"github.com/utopiops/automated-ops/runner/shared"
)

func (j *jobService) SetStatus(status string, executionId int, taskId int) error {
	url := config.Configs.Endpoints.AoAPI + fmt.Sprintf("/execution/id/%d/task/%d/result", executionId, taskId)
	token, err := j.authHelper.GetToken()
	if err != nil {
		return err
	}
	headers := []shared.Header{
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", token),
		},
	}
	data := map[string]string{
		"status": status,
	}
	json_data, err := json.Marshal(data)
	if err != nil {
		return err
	}
	body := bytes.NewBuffer(json_data)
	_, err, _ = j.httpHelper.HttpRequest(http.MethodPost, url, body, headers, 0)
	if err != nil {
		return err
	}
	return nil
}
