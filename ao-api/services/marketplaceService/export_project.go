package marketplaceService

import (
	"context"
	"fmt"
	"log"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/sirupsen/logrus"
)

func (ms *marketplaceService) ExportProject(accountId string, projectName string, dbService databaseService.DatabaseService, cService crudService.CrudService) (projectDto models.ProjectDto, err error) {
	projectDto = models.ProjectDto{}
	projectDto.Name = projectName

	// Get the list of all the tables of this project
	projectDto.DataBaseTables, err = getTables(accountId, projectName, dbService)
	if err != nil {
		log.Printf("Error getting project: %v", err)
		return
	}

	// Get the list of all the pipelines of this project
	pipelines, err := getPipelines(accountId, projectName, cService)
	if err != nil {
		return
	}
	projectDto.Pipelines = pipelines

	pages, err := ms.UIBuilderStore.GetExportablePageByProjectName(context.Background(), accountId, projectName)
	if err != nil {
		logrus.Errorf("Error getting UI pages: %v", err)
		return
	}
	projectDto.UIPages = pages

	return
}

func getTables(accountId, projectName string, dbService databaseService.DatabaseService) ([]models.DatabaseTable, error) {
	tableNames, err := dbService.GetTablesList(accountId, projectName)
	if err != nil {
		return nil, err
	}
	tables := make([]models.DatabaseTable, 0)
	for _, tableName := range tableNames {
		columns, err := dbService.ListTableColumns(accountId, projectName, tableName)
		if err != nil {
			return nil, err
		}
		tables = append(tables, models.DatabaseTable{Name: tableName, Columns: columns})
	}
	return tables, nil
}

func getPipelines(accountId, projectName string, cService crudService.CrudService) (projectPipelines []models.PipelineProjectDto, err error) {
	pipelines, err := cService.GetPipelines(accountId)
	if err != nil {
		return
	}
	fmt.Println("pipelines: ", pipelines)
	projectPipelines = make([]models.PipelineProjectDto, 0)
	for _, pipeline := range pipelines {
		if pipeline.ProjectName != projectName {
			continue
		}
		if pipeline.IsInteraction || pipeline.IsTemplate {
			pipelineDetailes, err := cService.GetPipelineByName(accountId, pipeline.Name, projectName)
			if err != nil {
				return nil, err
			}
			if pipeline.IsInteraction {
				dto, err := prepareInteraction(pipeline.Name, pipelineDetailes)
				if err != nil {
					return nil, err
				}
				projectPipelines = append(projectPipelines, dto)
			} else {
				dto, err := prepareTemplate(pipeline.Name, pipelineDetailes)
				if err != nil {
					return nil, err
				}
				projectPipelines = append(projectPipelines, dto)
			}
		}
	}
	return
}

func prepareInteraction(name string, pipelineSummery models.PipelineSummery) (models.PipelineProjectDto, error) {
	res := models.PipelineProjectDto{}
	res.IsInteraction = true
	res.IsPublic = pipelineSummery.IsPublic
	res.UserGroups = pipelineSummery.UserGroups
	res.Dto = models.PipelineDto{}
	res.Dto.Name = name
	res.Dto.Manifest.Tasks = make(map[string]models.Task)
	for taskName, task := range pipelineSummery.PipelineDetailes.Manifest.Tasks {
		if task.Integration != "" {
			task.Integration = ""
		}
		res.Dto.Manifest.Tasks[taskName] = task
	}
	res.Dto.Manifest.Triggers = make(map[string]models.EventTrigger)
	for triggerName, trigger := range pipelineSummery.PipelineDetailes.Manifest.Triggers {
		if trigger.Integration != "" {
			trigger.Integration = ""
		}
		res.Dto.Manifest.Triggers[triggerName] = trigger
	}
	return res, nil
}

func prepareTemplate(name string, pipelineSummery models.PipelineSummery) (models.PipelineProjectDto, error) {
	res := models.PipelineProjectDto{}
	res.IsTemplate = true
	res.IsPublic = pipelineSummery.IsPublic
	res.UserGroups = pipelineSummery.UserGroups
	res.Dto = models.PipelineDto{}
	res.Dto.Name = name
	res.Dto.Manifest.Tasks = make(map[string]models.Task)
	for taskName, task := range pipelineSummery.PipelineDetailes.Manifest.Tasks {
		if task.Integration != "" {
			task.Integration = ""
		}
		res.Dto.Manifest.Tasks[taskName] = task
	}
	res.Dto.Manifest.Triggers = make(map[string]models.EventTrigger)
	for triggerName, trigger := range pipelineSummery.PipelineDetailes.Manifest.Triggers {
		if trigger.Integration != "" {
			trigger.Integration = ""
		}
		res.Dto.Manifest.Triggers[triggerName] = trigger
	}
	return res, nil
}
