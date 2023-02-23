package projectService

import (
	"context"
	"encoding/json"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
	"github.com/sirupsen/logrus"
)

func (ps *projectService) AddProject(accountId string, project models.Project, uiBuilderService uibuilderService.UIbuilderService) error {

	tag, err := ps.initializeProject(accountId, project.Type, project.Name, project.DefaultUserGroup, project.HasDatabase, uiBuilderService)
	if err != nil {
		return err
	}

	project.Tag = tag

	// Add project to database
	if err := ps.Store.AddProject(noContext, accountId, project); err != nil {
		return err
	}

	return nil
}

// This function checks the plan limits for creating a project, creates the database if can and should and sets the default user group
func (ps *projectService) initializeProject(accountId, projectType, projectName, defaultUserGroup string, hasDatabase bool, uiBuilderService uibuilderService.UIbuilderService) (string, error) {
	// Check if use is allowed to create a new project based on his plan
	err := ps.canCreateProject(accountId, projectType)
	if err != nil {
		return "", err
	}

	// Check if user is allowed to create a new database based on his plan
	if hasDatabase {
		err := ps.canCreateDatabase(accountId)
		if err != nil {
			return "", err
		}
	}
	tag := utils.RandStringRunes(16, utils.FullRunes)

	err = ps.createDefaultIndexPage(context.Background(), accountId, tag, uiBuilderService)
	if err != nil {
		return "", err
	}

	if hasDatabase {
		// Create a database for the project
		return tag, ps.createAndPrepareDatabase(context.Background(), accountId, projectName, defaultUserGroup)
	}

	return tag, nil
}

// This utility function creates an index page that is empty and default page for uibuilder
func (ps *projectService) createDefaultIndexPage(ctx context.Context, accountId, projectTag string, uiBuilderService uibuilderService.UIbuilderService) error {
	indexPageContent := `
	{
        "layout":[],
        "dataSources":[],
        "classNames":{},
        "mode":"simple",
        "pageParams":[],
        "globals":[]
    }`
	indexPageContentMap := make(map[string]interface{})
	json.Unmarshal([]byte(indexPageContent), &indexPageContentMap)
	indexPageContentBytes, _ := json.Marshal(indexPageContentMap)
	page := models.UIPage{
		Name:       "index",
		Content:    indexPageContentBytes,
		AccountId:  accountId,
		Status:     "modified",
		ProjectTag: projectTag,
	}
	return uiBuilderService.UpsertPage(page)
}

// This utility function creates a database and does the initial set up
func (ps *projectService) createAndPrepareDatabase(ctx context.Context, accountId, projectName, defaultUserGroup string) error {
	if err := ps.Store.CreateProjectDatabase(ctx, accountId, projectName); err != nil {
		return err
	}
	if err := ps.Store.CreateDbUserAndGrantAccess(ctx, accountId, projectName); err != nil {
		return err
	}

	db, closeFunc, err := dbutil.GetDbInstance(accountId, projectName)
	if err != nil {
		return err
	}
	pingErr := db.Connection.Ping()
	log.Println("pingErr:", pingErr)
	defer closeFunc(db.Connection)
	if err := ps.TpUserStore.CreateUserGroupTable(db); err != nil {
		return err
	}
	if err := ps.TpUserStore.CreateUserInfoTable(db); err != nil {
		return err
	}
	if err := ps.TpUserStore.CreateSecurityCodeTable(db); err != nil {
		return err
	}
	if err := ps.DbStore.CreateViewsTable(db); err != nil {
		return err
	}

	if defaultUserGroup == "" {
		defaultUserGroup = "users"
	}

	// todo: add rollback if database creation fails
	return ps.TpUserStore.SetDefaultUserGroup(db, models.UserGroup{Name: defaultUserGroup})
}

// This utility function checks if the user can create a new database based on their plan
func (ps *projectService) canCreateDatabase(accountId string) error {
	hasAccess, err := ps.CheckCreateDatabaseAccess(accountId)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	if !hasAccess {
		return utils.ErrReachLimitationOfPlan
	}
	return nil
}

// This utility function checks if the user can create a new project based on their plan
func (ps *projectService) canCreateProject(accountId, projectType string) error {
	hasAccess, err := ps.CheckCreateProjectAccess(accountId, projectType)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	if !hasAccess {
		return utils.ErrReachLimitationOfPlan
	}
	return nil
}
