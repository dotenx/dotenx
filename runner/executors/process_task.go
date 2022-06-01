package executors

import (
	"fmt"
	"strings"

	"github.com/dotenx/dotenx/runner/config"
	"github.com/dotenx/dotenx/runner/models"
)

func ProcessTask(task *models.TaskDetails) (processedTask *models.Task) {
	processedTask = &models.Task{}
	processedTask.Details = *task
	processedTask.IsPredifined = true
	if task.Type == "Run image" {
		processedTask.IsPredifined = false
		processedTask.Details.Image = task.Body["image"].(string)
		processedTask.Script = strings.Split(task.Body["script"].(string), " ")
	} else {
		envs := make([]string, 0)
		for _, field := range task.MetaData.Fields {
			if value, ok := task.Body[field.Key]; ok {
				var envVar string
				envVar = field.Key + "=" + fmt.Sprintf("%v", value)
				envs = append(envs, envVar)
			}
		}
		processedTask.EnvironmentVariables = envs
		processedTask.EnvironmentVariables = append(processedTask.EnvironmentVariables, "RESULT_ENDPOINT="+task.ResultEndpoint)
		processedTask.EnvironmentVariables = append(processedTask.EnvironmentVariables, "WORKSPACE="+task.Workspace)
		processedTask.EnvironmentVariables = append(processedTask.EnvironmentVariables, "AUTHORIZATION="+config.Configs.Secrets.RunnerToken)
	}
	return
}
