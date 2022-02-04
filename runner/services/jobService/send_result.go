package jobService

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/utopiops/automated-ops/runner/config"
	"github.com/utopiops/automated-ops/runner/models"
)

func (manager *JobManager) SendResult(status models.TaskStatus) error {
	url := config.Configs.Endpoints.AoAPI + fmt.Sprintf("/execution/id/%d/task/%d/result", "executionId", "taskId")
	json_data, err := json.Marshal(status)
	if err != nil {
		return err
	}
	body := bytes.NewBuffer(json_data)
	_, err, _ = manager.HttpHelper.HttpRequest(http.MethodPost, url, body, nil, time.Minute)
	if err != nil {
		return err
	}
	return nil
}
