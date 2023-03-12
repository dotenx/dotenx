package integrationService

import (
	"context"
	"errors"
)

func (manager *IntegrationManager) DeleteIntegration(accountId string, integrationName string) (err error) {
	checkTasks, _ := manager.Store.CheckTasksForIntegration(context.Background(), accountId, integrationName)
	if checkTasks {
		return errors.New("your integration is used for a task")
	}
	checkTriggers, _ := manager.Store.CheckTriggersForIntegration(context.Background(), accountId, integrationName)
	if checkTriggers {
		return errors.New("your integration is used for a trigger")
	}
	return manager.Store.DeleteIntegration(context.Background(), accountId, integrationName)
}
