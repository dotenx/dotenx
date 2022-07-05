package triggerService

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/integrationService"
	"github.com/dotenx/dotenx/ao-api/stores/integrationStore"
)

type dockerCleint struct {
	cli *client.Client
}

func (manager *TriggerManager) StartChecking(store integrationStore.IntegrationStore) error {
	freq, err := strconv.Atoi(config.Configs.App.CheckTrigger)
	if err != nil {
		return err
	}
	for {
		// todo: handle error
		go manager.check(store)
		time.Sleep(time.Duration(freq) * time.Second)
		//time.Sleep(time.Duration(5) * time.Second)
	}
}
func (manager *TriggerManager) check(store integrationStore.IntegrationStore) error {
	triggers, err := manager.GetAllTriggers()
	if err != nil {
		return err
	}
	cli, err := client.NewClientWithOpts()
	if err != nil {
		fmt.Println("Unable to create docker client")
		return err
	}
	dc := dockerCleint{cli: cli}
	//fmt.Println(triggers)
	for _, trigger := range triggers {
		pipeline, err := manager.PipelineStore.GetByName(context.Background(), trigger.AccountId, trigger.Pipeline)
		if err != nil {
			fmt.Println("Unable to start checking this trigger:", err.Error())
			continue
		}
		if trigger.Type != "Schedule" && pipeline.IsActive && !pipeline.IsTemplate && !pipeline.IsInteraction {
			go dc.handleTrigger(manager.IntegrationService, trigger.AccountId, trigger, store, utils.GetNewUuid())
			manager.UtopiopsService.IncrementUsedTimes(models.AvaliableTriggers[trigger.Type].Author, "trigger", trigger.Type)
		}
	}
	return nil
}

func (dc dockerCleint) handleTrigger(service integrationService.IntegrationService, accountId string, trigger models.EventTrigger, store integrationStore.IntegrationStore, workspace string) {
	integration, err := service.GetIntegrationByName(accountId, trigger.Integration)
	if err != nil {
		return
	}
	img := models.AvaliableTriggers[trigger.Type].Image
	pipelineUrl := fmt.Sprintf("%s/execution/ep/%s/start", config.Configs.Endpoints.AoApi, trigger.Endpoint)
	envs := []string{
		"PIPELINE_ENDPOINT=" + pipelineUrl,
		"TRIGGER_NAME=" + trigger.Name,
		"WORKSPACE=" + workspace,
		"ACCOUNT_ID=" + accountId}
	for key, value := range integration.Secrets {
		envs = append(envs, "INTEGRATION_"+key+"="+value)
	}
	for key, value := range trigger.Credentials {
		envs = append(envs, key+"="+value.(string))
	}
	dc.checkTrigger(trigger.Name, img, envs)
}

func (dc dockerCleint) checkTrigger(triggerName, img string, envs []string) {
	/*reader*/ _, err := dc.cli.ImagePull(context.Background(), img, types.ImagePullOptions{})
	if err != nil {
		log.Println("error in pulling base image " + err.Error())
		return
	}
	//io.Copy(os.Stdout, reader) // to get pull image log
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
		&container.HostConfig{
			Mounts: []mount.Mount{
				{
					Type:   mount.TypeBind,
					Source: config.Configs.App.FileSharing,
					Target: "/tmp",
				},
			},
		}, networkConfig, nil, "")

	if err != nil {
		log.Println("error in creating container" + err.Error())
		return
	}
	err = dc.cli.ContainerStart(context.Background(), cont.ID, types.ContainerStartOptions{})
	if err != nil {
		log.Println("error in starting container" + err.Error())
		return
	}
	for {
		st, err := dc.cli.ContainerInspect(context.Background(), cont.ID)
		if err != nil {
			log.Println(err.Error())
			return
		}
		if !st.State.Running {
			break
		}
	}
	logs, err := dc.GetLogs(cont.ID)
	if err != nil {
		log.Println(err.Error())
	}
	fmt.Println("container: " + cont.ID + "###########   " + triggerName + " log: ")
	fmt.Println(logs)
	fmt.Println("##########################")
}
func (dc dockerCleint) GetLogs(containerId string) (string, error) {
	reader, err := dc.cli.ContainerLogs(context.Background(), containerId, types.ContainerLogsOptions{ShowStdout: true})
	if err != nil {
		log.Fatal(err)
		return "", err
	}
	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(reader)
	logs := buf.String()
	return logs, err
}
