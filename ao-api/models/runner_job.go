package models

type Job struct {
	ExecutionId int                    `json:"executionId"`
	TaskId      int                    `json:"taskId"`
	Timeout     int                    `json:"timeout"`
	Name        string                 `json:"name"`
	Type        string                 `json:"type"`
	Image       string                 `json:"image"`
	AccountId   string                 `json:"account_id"`
	Body        map[string]interface{} `json:"body"`
	MetaData    TaskDefinition         `json:"task_meta_data"`
}

// creates a new job dto for runner based on given task for certain execution
func NewJob(task TaskDetails, executionId int, accountId string) *Job {
	image := AvaliableTasks[task.Type].Image
	return &Job{
		ExecutionId: executionId,
		TaskId:      task.Id,
		Type:        task.Type,
		Timeout:     task.Timeout,
		Image:       image,
		Body:        task.Body,
		Name:        task.Name,
		AccountId:   accountId,
		MetaData:    AvaliableTasks[task.Type],
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
