package docker

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/utopiops/automated-ops/runner/models"
)

func (executor *dockerExecutor) Execute(task *models.Task) (result *models.TaskResult) {
	result = &models.TaskResult{}
	result.Id = task.Detailes.Id
	result.Status = models.StatusFailed
	if task.Image == "" {
		result.Error = errors.New("task dto is invalid and cant be processed")
		return
	}
	/*reader*/ _, err := executor.Client.ImagePull(context.Background(), task.Image, types.ImagePullOptions{})
	if err != nil {
		result.Error = errors.New("error in pulling base image")
		return
	}
	//io.Copy(os.Stdout, reader) // to get pull image log
	var cont container.ContainerCreateCreatedBody
	if !task.IsPredifined {
		cont, err = executor.Client.ContainerCreate(
			context.Background(),
			&container.Config{
				Image: task.Image,
				Cmd:   task.Script,
			},
			nil, nil, nil, "")
	} else {
		cont, err = executor.Client.ContainerCreate(
			context.Background(),
			&container.Config{
				Image: task.Image,
				Env:   task.EnvironmentVariables,
			},
			nil, nil, nil, "")
	}
	if err != nil {
		result.Error = errors.New("error in creating container")
		return
	}
	executor.Client.ContainerStart(context.Background(), cont.ID, types.ContainerStartOptions{})
	defer executor.Client.ContainerRemove(context.Background(), cont.ID, types.ContainerRemoveOptions{})
	timeCounter := 0
	for {
		time.Sleep(time.Second)
		timeCounter++
		statusCode := executor.CheckStatus(cont.ID)
		if statusCode == -1 { // failed
			break
		} else if statusCode == 0 { // done
			result.Status = models.StatusCompleted
			break
		} else if timeCounter == task.Detailes.Timeout { // timedout
			result.Error = errors.New("timed out")
			return
		}
	}
	result.Log, result.Error = executor.GetLogs(cont.ID)
	return
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
