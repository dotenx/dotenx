package gitIntegrationService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/dotenx/dotenx/ao-api/services/marketplaceService"
	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
	"github.com/dotenx/dotenx/ao-api/stores/gitIntegrationStore"
)

type GitIntegrationService interface {
	UpsertIntegration(integration models.GitIntegration) error
	GetIntegration(accountId, gitAccountId, provider string) (models.GitIntegration, error)
	ListIntegrations(accountId, provider string) ([]models.GitIntegration, error)
	ListRepositories(accountId, gitAccountId, provider string) ([]repository, error)
	ListBranches(accountId, gitAccountId, provider, repoFullName string) ([]branch, error)
	ExportProject(accountId, gitAccountId, provider, repoFullName, branchName, commitMessage, projectName string, mService marketplaceService.MarketplaceService, pService projectService.ProjectService, dbService databaseService.DatabaseService, cService crudService.CrudService) error
	ImportProject(accountId, gitAccountId, provider, repoFullName, branchName, projectName string, pService projectService.ProjectService, dbService databaseService.DatabaseService, cService crudService.CrudService, ubService uibuilderService.UIbuilderService) error
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
