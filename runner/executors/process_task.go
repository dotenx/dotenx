package executors

import (
	"fmt"
	"strings"

	"github.com/utopiops/automated-ops/runner/models"
)

func ProcessTask(task *models.TaskDetails) (processedTask *models.Task) {
	//fmt.Println(task)
	processedTask = &models.Task{}
	processedTask.Detailes = *task
	processedTask.IsPredifined = true
	switch task.Type {
	case "HttpCall":
		var body string
		if b, ok := task.Body["body"]; ok {
			body = fmt.Sprintf("%v", b)
		}
		processedTask.EnvironmentVariables = []string{"method=" + task.Body["method"].(string),
			"url=" + task.Body["url"].(string),
			"body=" + body}
	/*case "CreateAccount":*/
	case "GitlabAddMember":
		processedTask.EnvironmentVariables = []string{"privateToken=" + task.Body["privateToken"].(string),
			"id=" + task.Body["id"].(string),
			"userId=" + task.Body["userId"].(string),
			"accessLevel=" + task.Body["accessLevel"].(string),
			"expiresAt=" + task.Body["expiresAt"].(string),
			"type=" + task.Body["type"].(string),
			"action=" + "add"}
	case "GitlabRemoveMember":
		processedTask.EnvironmentVariables = []string{"privateToken=" + task.Body["privateToken"].(string),
			"id=" + task.Body["id"].(string),
			"userId=" + task.Body["userId"].(string),
			"type=" + task.Body["type"].(string),
			"action=" + "remove"}
	case "default":
		{
			processedTask.IsPredifined = false
			processedTask.Detailes.Image = task.Body["image"].(string)
			processedTask.Script = strings.Split(task.Body["script"].(string), " ")
		}
	}
	return
}

func IsTaskTypeValid(taskType string) bool {
	for t := range models.AvaliableTasks {
		if t == taskType {
			return true
		}
	}
	return false
}
