package integrationStore

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

type IntegrationStore interface {
	AddIntegration(ctx context.Context, accountId string, integration models.Integration) error
	DeleteIntegration(ctx context.Context, accountId string, integrationName string) error
	CheckTasksForIntegration(ctx context.Context, accountId string, integrationName string) (bool, error)
	CheckTriggersForIntegration(ctx context.Context, accountId string, integrationName string) (bool, error)
	GetIntegrationsByType(ctx context.Context, accountId, integrationType, projectName string) ([]models.Integration, error)
	GetAllintegrations(ctx context.Context, accountId, projectName string) ([]models.Integration, error)
	GetIntegrationByName(ctx context.Context, accountId, name string) (models.Integration, error)
	GetIntegrationForThirdPartyUser(ctx context.Context, accountId, tpAccountId, integrationType string) (models.Integration, error)
	UpdateIntegration(ctx context.Context, accountId, integrationName string, integration models.Integration) error
}

type integrationStore struct {
	db *db.DB
}

func New(db *db.DB) IntegrationStore {
	return &integrationStore{db: db}
}
