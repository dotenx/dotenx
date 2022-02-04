package docker

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/utopiops/automated-ops/runner/models"
)

func (executor *dockerExecutor) Execute(task *models.TaskDetails) *models.TaskResult {
	var containerImage string
	var timeOut float64
	var containerScript []interface{}
	var envVariables []string
	isPredefined := true
	switch task.Type {
	case "HttpCall":
		envVariables = []string{"method=" + task.Body["method"].(string),
			"url=" + task.Body["url"].(string),
			"body=" + task.Body["body"].(string),
			"timeout=" + task.Body["timeout"].(string)}
		containerImage = "awrmin/utopiopshttpcall"
	case "CreateAccount":
		envVariables = []string{}
		containerImage = "CreateAccountImage"
	case "GitlabAddMember":
		envVariables = []string{"privateToken=" + task.Body["privateToken"].(string),
			"id=" + task.Body["id"].(string),
			"userId=" + task.Body["userId"].(string),
			"accessLevel=" + task.Body["accessLevel"].(string),
			"expiresAt=" + task.Body["expiresAt"].(string),
			"type=" + "projects",
			"action=" + "add"}
		containerImage = "awrmin/utopiops"
	case "GitlabRemoveMember":
		envVariables = []string{"privateToken=" + task.Body["privateToken"].(string),
			"id=" + task.Body["id"].(string),
			"userId=" + task.Body["userId"].(string),
			"type=" + "projects",
			"action=" + "remove"}
		containerImage = "awrmin/utopiops"
	case "default":
		{
			isPredefined = false
			containerImage = task.Body["image"].(string)
			timeOut = task.Body["timeOut"].(float64)
			containerScript = task.Body["script"].([]interface{})
		}
	case "Invalid":
		return &models.TaskResult{Id: task.Id, Status: models.StatusFailed, Error: nil, Log: "unsupported task type"}
	default:
		return &models.TaskResult{Id: task.Id, Status: models.StatusFailed, Error: nil, Log: "unsupported task type"}
	}
	reader, err := executor.Client.ImagePull(context.Background(), containerImage, types.ImagePullOptions{})
	if err != nil {
		return &models.TaskResult{Id: task.Id, Status: models.StatusFailed, Error: nil, Log: "error in pulling base image"}
	}
	io.Copy(os.Stdout, reader)
	var cont container.ContainerCreateCreatedBody
	if !isPredefined {
		cmds := make([]string, 0)
		for _, value := range containerScript {
			cmds = append(cmds, value.(string))
		}
		cont, err = executor.Client.ContainerCreate(
			context.Background(),
			&container.Config{
				Image: containerImage,
				Cmd:   cmds,
			},
			nil, nil, nil, "")
	} else {
		cont, err = executor.Client.ContainerCreate(
			context.Background(),
			&container.Config{
				Image: containerImage,
				Env:   envVariables,
			},
			nil, nil, nil, "")
	}
	if err != nil {
		return &models.TaskResult{Id: task.Id, Status: models.StatusFailed, Error: nil, Log: "error in creating container"}
	}
	executor.Client.ContainerStart(context.Background(), cont.ID, types.ContainerStartOptions{})
	timeCounter := 0
	var status string
	for {
		time.Sleep(time.Second)
		timeCounter++
		statusCode := executor.CheckStatus(cont.ID)
		if statusCode == -1 { // failed
			status = models.StatusFailed
			break
		} else if statusCode == 0 { // done
			status = models.StatusSuccess
			break
		} else if timeCounter == int(timeOut) { // timedout
			status = models.StatusTimedout
			break
		}
	}
	logs, _ := executor.GetLogs(cont.ID)
	executor.Client.ContainerRemove(context.Background(), cont.ID, types.ContainerRemoveOptions{})
	return &models.TaskResult{Id: task.Id, Status: status, Error: nil, Log: logs}
}

func (executor *dockerExecutor) CheckStatus(containerId string) int {
	inspect, err := executor.Client.ContainerInspect(context.Background(), containerId)
	if err != nil || inspect.ContainerJSONBase.State.Error != "" {
		fmt.Println(err)
		return -1
	}
	if inspect.ContainerJSONBase.State.Running {
		return 1
	}
	return 0
}

func (executor *dockerExecutor) GetLogs(containerId string) (string, error) {
	reader, err := executor.Client.ContainerLogs(context.Background(), containerId, types.ContainerLogsOptions{ShowStdout: true})
	if err != nil {
		log.Fatal(err)
		return "", err
	}
	buf := new(bytes.Buffer)
	buf.ReadFrom(reader)
	logs := buf.String()
	return logs, nil
}
