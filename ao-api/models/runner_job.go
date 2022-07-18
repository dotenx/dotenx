package models

import (
	"fmt"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/miniTasks"
	"github.com/sirupsen/logrus"
)

type Job struct {
	ExecutionId    int                    `json:"executionId"`
	TaskId         int                    `json:"taskId"`
	Timeout        int                    `json:"timeout"`
	Name           string                 `json:"name"`
	Type           string                 `json:"type"`
	Image          string                 `json:"image"`
	AccountId      string                 `json:"account_id"`
	Body           map[string]interface{} `json:"body"`
	MetaData       TaskDefinition         `json:"task_meta_data"`
	ResultEndpoint string                 `json:"result_endpoint"`
	WorkSpace      string                 `json:"workspace"`
}

// creates a new job dto for runner based on given task for certain execution
func NewJob(task TaskDetails, executionId int, accountId string) *Job {
	image := AvaliableTasks[task.Type].Image
	return &Job{
		ExecutionId:    executionId,
		TaskId:         task.Id,
		Type:           task.Type,
		Timeout:        task.Timeout,
		Image:          image,
		Body:           task.Body,
		Name:           task.Name,
		AccountId:      accountId,
		MetaData:       AvaliableTasks[task.Type],
		ResultEndpoint: fmt.Sprintf("%s/execution/id/%d/task/%d/result", config.Configs.Endpoints.AoApi, executionId, task.Id),
	}
}

// add integration fields to job body and task meta data fields
func (job *Job) SetIntegration(integration Integration) {
	for key, value := range integration.Secrets {
		k := "INTEGRATION_" + key
		job.Body[k] = value
		job.MetaData.Fields = append(job.MetaData.Fields, TaskField{Key: k, Type: "text"})
	}
}

func (job *Job) SetRunCodeFields() {
	variables := ""
	for key, _ := range job.Body {
		if key != "code" && key != "dependency" {
			if variables != "" {
				variables += ","
			}
			variables += key
			job.MetaData.Fields = append(job.MetaData.Fields, TaskField{Key: key, Type: "text"})
		}
	}
	job.MetaData.Fields = append(job.MetaData.Fields, TaskField{Key: "VARIABLES", Type: "text"})
	job.Body["VARIABLES"] = variables
}

func (job *Job) PrepRunMiniTasks() {
	// for taskName, task := range manifest.Tasks {
	// 	if task.Type == "Run mini tasks" {
	// 		task.Type = "Run node code"
	// 	}
	// 	manifest.Tasks[taskName] = task
	// }
	// return manifest, nil
	job.Type = "Run node code"
	job.MetaData = AvaliableTasks["Run node code"]
	logrus.Info(job.Body)
	logrus.Info(job.Body["tasks"])

	importStore := miniTasks.NewImportStore()
	parsed := job.Body["tasks"].(map[string]interface{})
	code, err := miniTasks.ConvertToCode(parsed["steps"].([]interface{}), &importStore)

	if err != nil {
		fmt.Println(err)
	}

	fmt.Println(`********************************************************************************`)
	fmt.Println(code)
	fmt.Println(`********************************************************************************`)
	job.Body["code"] = fmt.Sprintf("module.exports = () => {\n%s\n}", code)
	job.Body["VARIABLES"] = "outputs"
	job.Body["outputs"] = make([]string, 0)
	job.Body["dependency"] = "{}"
	delete(job.Body, "tasks")
}
