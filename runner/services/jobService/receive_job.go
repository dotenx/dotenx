package jobService

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	uuid "github.com/nu7hatch/gouuid"
	"github.com/utopiops/automated-ops/runner/config"
	"github.com/utopiops/automated-ops/runner/models"
)

func (manager *JobManager) StartReceiving(jobChan chan models.Job) {
	for {
		token, err := uuid.NewV4()
		if err != nil {
			log.Println(err)
			return
		}
		url := fmt.Sprintf("%s/next/queue/%s/%s", config.Configs.Endpoints.JobScheduler, config.Configs.Queue.Name, token.String())
		out, err, _ := manager.HttpHelper.HttpRequest(http.MethodGet, url, nil, nil, time.Minute)
		if err != nil {
			continue
		}
		var job models.Job
		json.Unmarshal(out, &job)
		if job.Id != "" {
			job.Token = token.String()
			fmt.Println(job)
			jobChan <- job
		} else {
			time.Sleep(time.Duration(5 * time.Second))
		}
	}
}
