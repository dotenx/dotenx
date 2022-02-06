package queueService

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/utopiops/automated-ops/ao-api/config"
)

type bullQueue struct {
}

func NewBullQueue() QueueService {
	return &bullQueue{}
}

func (b *bullQueue) AddUser(accountId string) error {
	return nil
}
func (b *bullQueue) QueueTasks(accountId, priority string, tasks ...interface{}) error {
	queueName := fmt.Sprintf("%s-%s", accountId, priority)
	url := fmt.Sprintf("%s/queue/%s/job", config.Configs.Queue.BULL, queueName)
	for _, task := range tasks {
		body, err := json.Marshal(task)
		if err != nil {
			return err
		}
		req, _ := http.NewRequest("POST", url, bytes.NewBuffer(body))
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			log.Println(err)
			return err
		}
		if resp.StatusCode != 200 {
			err = fmt.Errorf("bull server responded with status %s", resp.Status)
			log.Println(err)
			return err
		}

	}

	return nil
}
func (b *bullQueue) DequeueTask(accountId, priority string) (interface{}, error) {
	return nil, nil
}
