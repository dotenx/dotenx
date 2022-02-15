package crudService

import "github.com/utopiops/automated-ops/ao-api/models"

func (cm *crudManager) ActivatePipeline(accountId string, name string, version int16) error {
	return cm.Store.Activate(noContext, accountId, name, int16(version))
}

func (cm *crudManager) CreatePipeLine(base *models.Pipeline, pipeline *models.PipelineVersion) error {
	return cm.Store.Create(noContext, base, pipeline)
}

func (cm *crudManager) GetPipelineByVersion(version int16, accountId string, name string) (models.PipelineVersion, string, error) {
	return cm.Store.GetByVersion(noContext, version, accountId, name)
}
func (cm *crudManager) GetPipelines(accountId string) ([]models.Pipeline, error) {
	return cm.Store.GetPipelines(noContext, accountId)
}

func (cm *crudManager) ListPipelineVersionsByName(accountId string, name string) ([]models.PipelineVersionSummary, error) {
	return cm.Store.ListPipelineVersionsByName(noContext, accountId, name)
}

func (cm *crudManager) GetAllExecutions(accountId string, name string) ([]interface{}, error) {
	pipelineId, err := cm.Store.GetPipelineId(noContext, accountId, name)
	if err != nil {
		return nil, err
	}
	return cm.Store.GetAllExecutions(noContext, pipelineId)
}
