package jobService

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/utopiops/automated-ops/runner/config"
	"github.com/utopiops/automated-ops/runner/models"
)

func (manager *JobManager) StartReceiving(jobChan chan models.Job) {
	url := fmt.Sprintf("%s/next/queue/%s/%s", config.Configs.Endpoints.JobScheduler, config.Configs.Queue.Name, config.Configs.Queue.Token)
	for {
		out, err, _ := manager.HttpHelper.HttpRequest(http.MethodGet, url, nil, nil, time.Minute)
		if err != nil {
			continue
		}
		var job models.Job
		json.Unmarshal(out, &job)
		jobChan <- job
		time.Sleep(time.Duration(5 * time.Second))
	}
}
