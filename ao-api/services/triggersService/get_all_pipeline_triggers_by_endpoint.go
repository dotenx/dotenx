package triggerService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (manager *TriggerManager) GetAllTriggersForPipelineByEndpoint(pipelineEndpoint string) ([]models.EventTrigger, error) {
	return manager.Store.GetAllTriggersForPipelineByEndpoint(context.Background(), pipelineEndpoint)

}
