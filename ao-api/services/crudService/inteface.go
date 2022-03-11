package crudService

import (
	"context"

	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/stores/pipelineStore"
)

func NewCrudService(store pipelineStore.PipelineStore) CrudService {
	return &crudManager{Store: store}
}

type CrudService interface {
	GetAllExecutions(accountId string, name string) ([]models.Execution, error)
	CreatePipeLine(base *models.Pipeline, pipeline *models.PipelineVersion) error
	GetPipelines(accountId string) ([]models.Pipeline, error)
	GetPipelineByName(accountId string, name string) (models.PipelineVersion, string, error)
	DeletePipeline(accountId, name string) (err error)
}

type crudManager struct {
	Store pipelineStore.PipelineStore
}

var noContext = context.Background()
