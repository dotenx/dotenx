package triggerService

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"

	"github.com/utopiops/automated-ops/ao-api/config"
	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/stores/integrationStore"
)

type dockerCleint struct {
	cli *client.Client
}

func (manager *TriggerManager) StartChecking(accId string, store integrationStore.IntegrationStore) error {
	triggers, err := manager.Store.GetAllTriggers(context.Background(), accId)
	if err != nil {
		return err
	}
	freq, err := strconv.Atoi(config.Configs.App.CheckTrigger)
	if err != nil {
		return err
	}
	cli, err := client.NewClientWithOpts()
	if err != nil {
		fmt.Println("Unable to create docker client")
		return err
	}
	dc := dockerCleint{cli: cli}
	for _, trigger := range triggers {
		go dc.handleTrigger(accId, trigger, store, freq)
	}
	return nil
}

func (dc dockerCleint) handleTrigger(accountId string, trigger models.EventTrigger, store integrationStore.IntegrationStore, freq int) {
	integration, err := store.GetIntegrationsByName(context.Background(), accountId, trigger.Integration)
	if err != nil {
		return
	}
	img := models.AvaliableTriggers[trigger.Type].Image
	pipelineUrl := fmt.Sprintf("%s/execution/ep/%s/start", config.Configs.Endpoints.AoApi, trigger.Endpoint)
	envs := []string{"CREDENTIAL_URL=" + integration.Url,
		"CREDENTIAL_KEY=" + integration.Key,
		"CREDENTIAL_SECRET=" + integration.Secret,
		"CREDENTIAL_ACCESS_TOKEN=" + integration.AccessToken,
		"PIPELINE_ENDPOINT=" + pipelineUrl}
	for key, value := range trigger.Credentials {
		envs = append(envs, key+"="+value.(string))
	}
	for {
		dc.checkTrigger(img, envs)
		time.Sleep(time.Duration(freq) * time.Second)
	}
}

func (dc dockerCleint) checkTrigger(img string, envs []string) {
	reader, err := dc.cli.ImagePull(context.Background(), img, types.ImagePullOptions{})
	if err != nil {
		log.Println("error in pulling base image " + err.Error())
		return
	}
	io.Copy(os.Stdout, reader) // to get pull image log
	var cont container.ContainerCreateCreatedBody
	networkConfig := &network.NetworkingConfig{
		EndpointsConfig: map[string]*network.EndpointSettings{},
	}
	gatewayConfig := &network.EndpointSettings{
		Gateway: "local",
	}
	networkConfig.EndpointsConfig["local"] = gatewayConfig
	cont, err = dc.cli.ContainerCreate(
		context.Background(),
		&container.Config{
			Image: img,
			Env:   envs,
		},
		nil, networkConfig, nil, "")

	if err != nil {
		log.Println("error in creating container" + err.Error())
		return
	}
	err = dc.cli.ContainerStart(context.Background(), cont.ID, types.ContainerStartOptions{})
	if err != nil {
		log.Println("error in starting container" + err.Error())
		return
	}
	time.Sleep(time.Duration(10) * time.Second)
	logs, err := dc.GetLogs(cont.ID)
	if err != nil {
		log.Println(err.Error())
	} else {
		log.Println("no err")
	}
	fmt.Println(logs)
}
func (dc dockerCleint) GetLogs(containerId string) (string, error) {
	reader, err := dc.cli.ContainerLogs(context.Background(), containerId, types.ContainerLogsOptions{ShowStdout: true})
	if err != nil {
		log.Fatal(err)
		return "", err
	}
	buf := new(bytes.Buffer)
	buf.ReadFrom(reader)
	logs := buf.String()
	return logs, nil
}
