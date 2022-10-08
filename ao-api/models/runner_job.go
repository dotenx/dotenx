package models

import (
	"fmt"

	"github.com/dotenx/dotenx/ao-api/config"
)

type Job struct {
	ExecutionId    int                    `json:"executionId"`
	TaskId         int                    `json:"taskId"`
	Timeout        int                    `json:"timeout"`
	Name           string                 `json:"name"`
	Type           string                 `json:"type"`
	AwsLambda      string                 `json:"aws_lambda"`
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
		AwsLambda:      task.AwsLambda,
		Timeout:        task.Timeout,
		Image:          image,
		Body:           nil,
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
		// for inputNumber, _ := range job.Body {
		job.Body[k] = value
		// }
		job.MetaData.Fields = append(job.MetaData.Fields, TaskField{Key: k, Type: "text"})
	}
}

// AddDynamicValuesToMetaData adds dynamic value keys to task meta data
func (job *Job) AddDynamicValuesToMetaData() {
	dynamicValueKeys := make([]string, 0)
	// for inputNumber, _ := range job.Body {
	for key, _ := range job.Body {
		if !job.isInFields(key) {
			dynamicValueKeys = append(dynamicValueKeys, key)
		}
	}
	// break
	// }
	if len(dynamicValueKeys) > 0 {
		job.MetaData.Fields = append(job.MetaData.Fields, TaskField{Key: "DYNMAIC_VARIABLE_KEYS", Type: "array"})
		job.MetaData.Fields = append(job.MetaData.Fields, TaskField{Key: "DYNMAIC_VARIABLES", Type: "json"})
		// for inputNumber, _ := range job.Body {
		dynamicValues := make(map[string]interface{})
		job.Body["DYNMAIC_VARIABLE_KEYS"] = dynamicValueKeys
		for _, key := range dynamicValueKeys {
			dynamicValues[key] = job.Body[key]
		}
		job.Body["DYNMAIC_VARIABLES"] = dynamicValues
		// }
	}
}

func (job *Job) isInFields(key string) bool {
	for _, field := range job.MetaData.Fields {
		if field.Key == key {
			return true
		}
	}
	return false
}

// TODO change this and use AddDynamicValuesToMetaData logic to handle it
func (job *Job) SetRunCodeFields() {
	variables := ""
	// for inputNumber, _ := range job.Body {
	for key, _ := range job.Body {
		if key != "code" && key != "dependency" {
			if variables != "" {
				variables += ","
			}
			variables += key
			// TODO check here if field is already exist in task meta data
			job.MetaData.Fields = append(job.MetaData.Fields, TaskField{Key: key, Type: "text"})
		}
	}
	// TODO check here if field is already exist in task meta data
	job.MetaData.Fields = append(job.MetaData.Fields, TaskField{Key: "VARIABLES", Type: "text"})
	job.Body["VARIABLES"] = variables
	// }
}

func (job *Job) PrepRunMiniTasks() {
	// for taskName, task := range manifest.Tasks {
	// 	if task.Type == "Custom task" {
	// 		task.Type = "Run node code"
	// 	}
	// 	manifest.Tasks[taskName] = task
	// }
	// return manifest, nil
	job.Type = "Run node code"
	job.MetaData = AvaliableTasks["Run node code"]
	// for inputNumber, _ := range job.Body {
	// logrus.Info(job.Body)
	// logrus.Info(job.Body["tasks"])
	// importStore := miniTasks.NewImportStore()
	// parsed := job.Body[inputNumber]["tasks"].(map[string]interface{})
	// code, err := miniTasks.ConvertToCode(parsed["steps"].([]interface{}), &importStore)

	// if err != nil {
	// 	fmt.Println(err)
	// }

	// fmt.Println(`********************************************************************************`)
	// fmt.Println(code)
	// fmt.Println(`********************************************************************************`)
	// job.Body[inputNumber]["code"] = fmt.Sprintf("module.exports = () => {\n%s\n}", code)
	// job.Body[inputNumber]["VARIABLES"] = "outputs"
	// job.Body[inputNumber]["outputs"] = make([]string, 0)
	// job.Body[inputNumber]["dependency"] = "{}"
	delete(job.Body, "tasks")
	// }
}
