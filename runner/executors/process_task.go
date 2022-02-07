package executors

import (
	"fmt"
	"strings"

	"github.com/utopiops/automated-ops/runner/models"
)

func ProcessTask(task *models.TaskDetails) (processedTask *models.Task) {
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
		processedTask.Image = "awrmin/utopiopshttpcall"
	/*case "CreateAccount":
	envVariables = []string{}
	containerImage = "CreateAccountImage"*/
	case "GitlabAddMember":
		processedTask.EnvironmentVariables = []string{"privateToken=" + task.Body["privateToken"].(string),
			"id=" + task.Body["id"].(string),
			"userId=" + task.Body["userId"].(string),
			"accessLevel=" + task.Body["accessLevel"].(string),
			"expiresAt=" + task.Body["expiresAt"].(string),
			"type=" + "projects",
			"action=" + "add"}
		processedTask.Image = "awrmin/utopiops"
	case "GitlabRemoveMember":
		processedTask.EnvironmentVariables = []string{"privateToken=" + task.Body["privateToken"].(string),
			"id=" + task.Body["id"].(string),
			"userId=" + task.Body["userId"].(string),
			"type=" + "projects",
			"action=" + "remove"}
		processedTask.Image = "awrmin/utopiops"
	case "default":
		{
			processedTask.IsPredifined = false
			processedTask.Image = task.Body["image"].(string)
			processedTask.Script = strings.Split(task.Body["script"].(string), " ")
		}
	}
	return
}
