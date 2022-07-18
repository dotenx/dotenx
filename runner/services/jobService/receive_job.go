package jobService

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/dotenx/dotenx/runner/config"
	"github.com/dotenx/dotenx/runner/models"
	uuid "github.com/nu7hatch/gouuid"
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
		//fmt.Println(string(out))
		var job models.Job
		json.Unmarshal(out, &job)
		if job.Id != "" {
			job.Token = token.String()
			jobChan <- job
		} else {
			time.Sleep(time.Duration(100 * time.Millisecond))
		}
	}
}
