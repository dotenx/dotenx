package projectService

import (
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/dotenx/dotenx/ao-api/services/marketplaceService"
	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
)

func (ps *projectService) ImportProject(accountId, newProjectName, newProjectDescription string, itemId int, mService marketplaceService.MarketplaceService, dbService databaseService.DatabaseService, cService crudService.CrudService, uiBuilderService uibuilderService.UIbuilderService) error {
	project, err := mService.GetProjectOfItem(itemId)
	if err != nil {
		return err
	}

	hasDatabase := false
	if len(project.DataBaseTables) > 0 {
		hasDatabase = true
	}

	err = ps.AddProject(accountId, models.Project{Name: newProjectName, Description: newProjectDescription, HasDatabase: hasDatabase}, uiBuilderService)
	if err != nil {
		return err
	}
	for _, table := range project.DataBaseTables {
		if utils.ContainsString(utils.UserDatabaseDefaultTables, table.Name) {
			continue
		}
		err := dbService.AddTable(accountId, newProjectName, table.Name, table.IsPublic, table.IsWritePublic)
		if err != nil {
			return err
		}
		for _, column := range table.Columns {
			if column.Name != "id" && column.Name != "creator_id" { //AddTableColumn will add id and creator_id columns to every table by default
				err = dbService.AddTableColumn(accountId, newProjectName, table.Name, column.Name, column.Type)
				if err != nil {
					return err
				}
			}
		}
	}
	for _, pipeline := range project.Pipelines {
		base := models.Pipeline{
			AccountId:     accountId,
			Name:          pipeline.Dto.Name,
			IsInteraction: pipeline.IsInteraction,
			IsTemplate:    pipeline.IsTemplate,
			ProjectName:   newProjectName,
		}

		pipelineVersion := models.PipelineVersion{
			Manifest: pipeline.Dto.Manifest,
		}
		err := cService.CreatePipeLine(&base, &pipelineVersion, pipeline.IsTemplate, pipeline.IsInteraction, newProjectName)
		if err != nil {
			return err
		}
	}

	prj, err := ps.GetProject(accountId, newProjectName)
	if err != nil {
		return err
	}

	for _, page := range project.UIPages {
		err := uiBuilderService.UpsertPage(models.UIPage{
			AccountId:  accountId,
			Name:       page.Name,
			Content:    page.Content,
			ProjectTag: prj.Tag,
			Status:     "modified", // todo: use enum
		})
		if err != nil {
			return err
		}
	}

	return nil
}
