package queueService

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/config"
)

type bullQueue struct {
}

type QueueService interface {
	AddUser(string) error
	QueueTasks(string, string, ...interface{}) error
	DequeueTask(string, string) (interface{}, error)
}

func NewBullQueue() QueueService {
	return &bullQueue{}
}

func (b *bullQueue) AddUser(accountId string) error {
	return nil
}

func (b *bullQueue) QueueTasks(accountId, priority string, tasks ...interface{}) error {
	// queueName := fmt.Sprintf("%s-%s", accountId, priority)
	queueName := fmt.Sprintf("%s-%s", "123456", priority)
	url := fmt.Sprintf("%s/queue/%s/job", config.Configs.Queue.BULL, queueName)
	for _, task := range tasks {
		body, err := json.Marshal(task)
		if err != nil {
			return err
		}
		fmt.Println(string(body))
		req, _ := http.NewRequest("POST", url, bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
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
