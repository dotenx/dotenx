package triggerService

import "github.com/sirupsen/logrus"

func (manager *TriggerManager) HandleScheduledTriggers(pipelineEndpoint, accountId string) (err error) {
	res, err := manager.ExecutionService.StartPipeline(make(map[string]interface{}), accountId, pipelineEndpoint)
	if err != nil {
		logrus.Error("error while starting pipeline: " + err.Error())
		return
	}
	logrus.Info("pipeline started successfully: %v\n", res)
	return
}
