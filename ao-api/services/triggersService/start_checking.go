package triggerService

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
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
	for start := time.Now(); time.Since(start) < time.Duration(freq)*time.Second; {
		dc.checkTrigger(img, envs)
	}
}

func (dc dockerCleint) checkTrigger(img string, envs []string) {
	/*reader,*/
	_, err := dc.cli.ImagePull(context.Background(), img, types.ImagePullOptions{})
	if err != nil {
		log.Println("error in pulling base image " + err.Error())
		return
	}
	//io.Copy(os.Stdout, reader) // to get pull image log
	var cont container.ContainerCreateCreatedBody
	cont, err = dc.cli.ContainerCreate(
		context.Background(),
		&container.Config{
			Image: img,
			Env:   envs,
		},
		nil, nil, nil, "")

	if err != nil {
		log.Println("error in creating container" + err.Error())
		return
	}
	dc.cli.ContainerStart(context.Background(), cont.ID, types.ContainerStartOptions{})
}
