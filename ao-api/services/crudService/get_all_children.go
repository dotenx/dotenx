package crudService

import "github.com/dotenx/dotenx/ao-api/models"

func (cm *crudManager) GetTemplateChildren(accountId, project, name string) ([]models.Pipeline, error) {
	return cm.Store.GetAllTemplateChildren(noContext, accountId, project, name)
}
