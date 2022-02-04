package jobService

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/utopiops/automated-ops/runner/config"
	"github.com/utopiops/automated-ops/runner/models"
)

func (manager *JobManager) StartReceiving(clientId string, taskChan chan models.Task) {
	url := config.Configs.Endpoints.AoAPI + fmt.Sprintf("/execution/id/%d/task/%d/result", "executionId", "taskId")
	for {
		out, err, _ := manager.HttpHelper.HttpRequest(http.MethodGet, url, nil, nil, time.Minute)
		if err != nil {
			continue
		}
		fmt.Println(string(out))
		var task models.Task
		json.Unmarshal(out, &task)
		fmt.Println(task)
		taskChan <- task
	}
}
