package gitIntegrationService

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
	"github.com/sirupsen/logrus"
)

func (service *gitIntegrationService) ImportProject(accountId, gitAccountId, provider, repoFullName, branchName, projectName string, pService projectService.ProjectService, dbService databaseService.DatabaseService, cService crudService.CrudService, ubService uibuilderService.UIbuilderService) error {
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
	var projectDto models.ProjectDto

	switch provider {
	case "github":
		fileBytes, err := readFileFromGithub(secrets["access_token"].(string), repoFullName, branchName, "dotenx/project.json")
		if err != nil {
			return err
		}
		err = json.Unmarshal(fileBytes, &projectDto)
		if err != nil {
			return err
		}
	default:
		return errors.New("provider should be one of these values: ['github', 'gitlab', 'bitbucket']")
	}

	if projectDto.AccountId != accountId || projectDto.Name != projectName {
		return errors.New("the selected branch hasn't entities of this project")
	}

	if project.HasDatabase {
		currentTableNames, err := dbService.GetTablesList(accountId, projectName)
		if err != nil {
			return err
		}
		newTableNames := make([]string, 0)

		for _, table := range projectDto.DataBaseTables {
			newTableNames = append(newTableNames, table.Name)
			if utils.ContainsString(utils.UserDatabaseDefaultTables, table.Name) {
				continue
			}
			if !utils.ContainsString(currentTableNames, table.Name) {
				err := dbService.AddTable(accountId, projectName, table.Name, table.IsPublic, table.IsWritePublic)
				if err != nil {
					return err
				}
			}

			currentColumns, err := dbService.ListTableColumns(accountId, projectName, table.Name)
			if err != nil {
				return err
			}
			currentColumnNames := make([]string, 0)
			newColumnNames := make([]string, 0)
			for _, c := range currentColumns {
				currentColumnNames = append(currentColumnNames, c.Name)
			}
			for _, column := range table.Columns {
				newColumnNames = append(newColumnNames, column.Name)
				if !utils.ContainsString(currentColumnNames, column.Name) {
					if column.Name != "id" && column.Name != "creator_id" { //AddTableColumn will add id and creator_id columns to every table by default
						err = dbService.AddTableColumn(accountId, projectName, table.Name, column.Name, column.Type)
						if err != nil {
							return err
						}
					}
				}
			}
			for _, columnName := range currentColumnNames {
				if !utils.ContainsString(newColumnNames, columnName) {
					if columnName != "id" && columnName != "creator_id" {
						err = dbService.DeleteTableColumn(accountId, projectName, table.Name, columnName)
						if err != nil {
							return err
						}
					}
				}
			}
		}

		for _, tableName := range currentTableNames {
			if !utils.ContainsString(newTableNames, tableName) {
				if utils.ContainsString(utils.UserDatabaseDefaultTables, tableName) {
					continue
				}
				err = dbService.DeleteTable(accountId, projectName, tableName)
				if err != nil {
					return err
				}
			}
		}
	}

	err = cService.DeleteAllPipelines(accountId, projectName)
	if err != nil {
		return nil
	}
	for _, pipeline := range projectDto.Pipelines {
		base := models.Pipeline{
			AccountId:     accountId,
			Name:          pipeline.Dto.Name,
			IsInteraction: pipeline.IsInteraction,
			IsTemplate:    pipeline.IsTemplate,
			ProjectName:   projectName,
		}
		pipelineVersion := models.PipelineVersion{
			Manifest: pipeline.Dto.Manifest,
		}
		err := cService.CreatePipeLine(&base, &pipelineVersion, pipeline.IsTemplate, pipeline.IsInteraction, projectName)
		if err != nil {
			return err
		}
	}

	for _, page := range projectDto.UIPages {
		err := ubService.UpsertPage(models.UIPage{
			AccountId:  accountId,
			Name:       page.Name,
			Content:    page.Content,
			ProjectTag: project.Tag,
			Status:     "modified", // todo: use enum
		})
		if err != nil {
			return err
		}
	}
	return nil
}

func readFileFromGithub(accessToken, repoFullName, branchName, filePath string) ([]byte, error) {
	headers := []utils.Header{
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", accessToken),
		},
	}
	helper := utils.NewHttpHelper(utils.NewHttpClient())
	readFileUrl := fmt.Sprintf("https://api.github.com/repos/%s/contents/%s?ref=%s", repoFullName, filePath, branchName)
	out, err, statusCode, _ := helper.HttpRequest(http.MethodGet, readFileUrl, nil, headers, 0, true)
	logrus.Info("url:", readFileUrl)
	logrus.Info("statusCode here:", statusCode)
	if err != nil || statusCode != http.StatusOK {
		logrus.Info(string(out))
		if err == nil {
			err = errors.New("request to Github api wasn't successful")
		}
		logrus.Error(err.Error())
		return nil, err
	}
	fileInfo := make(map[string]interface{})
	err = json.Unmarshal(out, &fileInfo)
	if err != nil {
		logrus.Error(err.Error())
		return nil, err
	}
	content, err := base64.StdEncoding.DecodeString(fileInfo["content"].(string))
	if err != nil {
		logrus.Error(err.Error())
		return nil, err
	}
	return content, nil
}
