package gitIntegrationService

import (
	"encoding/json"
	"errors"

	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/dotenx/dotenx/ao-api/services/marketplaceService"
	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/sirupsen/logrus"
)

func (service *gitIntegrationService) ExportProject(accountId, gitAccountId, provider, repoFullName, branchName, commitMessage, projectName string, mService marketplaceService.MarketplaceService, pService projectService.ProjectService, dbService databaseService.DatabaseService, cService crudService.CrudService) error {
	var secrets map[string]interface{}
	integration, err := service.GetIntegration(accountId, gitAccountId, provider)
	if err != nil {
		return err
	}
	err = json.Unmarshal(integration.Secrets, &secrets)
	if err != nil {
		return err
	}

	project, err := pService.GetProject(accountId, projectName)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	var projectDto interface{}
	projectDto, err = mService.ExportProject(accountId, projectName, project.Tag, project.HasDatabase, dbService, cService)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}

	switch provider {
	case "github":
		return service.ExportProjectToGithub(secrets["access_token"].(string), integration.GitUsername, repoFullName, branchName, commitMessage, projectDto)
	default:
		return errors.New("provider should be one of these values: ['github', 'gitlab', 'bitbucket']")
	}
}
