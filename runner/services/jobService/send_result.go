package jobService

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/utopiops/automated-ops/runner/config"
	"github.com/utopiops/automated-ops/runner/models"
	"github.com/utopiops/automated-ops/runner/shared"
)

func (manager *JobManager) SendResult(jobId string, status models.TaskStatus) error {
	url := fmt.Sprintf("%s/queue/%s/job/%s/result", config.Configs.Endpoints.JobScheduler, config.Configs.Queue.Name, jobId)
	headers := []shared.Header{
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
	}
	json_data, err := json.Marshal(status)
	if err != nil {
		return err
	}
	body := bytes.NewBuffer(json_data)
	_, err, _ = manager.HttpHelper.HttpRequest(http.MethodPost, url, body, headers, time.Minute)
	if err != nil {
		return err
	}
	return nil
}
