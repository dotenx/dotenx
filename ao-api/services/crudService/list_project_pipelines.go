package crudService

import (
	"github.com/dotenx/dotenx/ao-api/models"
)

func (cm *crudManager) ListProjectPipelines(accountId, projectName string) ([]models.Pipeline, error) {
	return cm.Store.ListProjectPipelines(noContext, accountId, projectName)
}
