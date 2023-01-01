package gitIntegrationService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/stores/gitIntegrationStore"
)

type GitIntegrationService interface {
	UpsertIntegration(integration models.GitIntegration) error
	GetIntegration(accountId, gitAccountId, provider string) (models.GitIntegration, error)
	ListIntegrations(accountId, provider string) ([]models.GitIntegration, error)
	ListRepositories(accountId, gitAccountId, provider string) ([]repository, error)
}

func NewGitIntegrationService(store gitIntegrationStore.GitIntegrationStore) GitIntegrationService {
	return &gitIntegrationService{
		Store: store,
	}
}

type gitIntegrationService struct {
	Store gitIntegrationStore.GitIntegrationStore
}

var noContext = context.Background()
