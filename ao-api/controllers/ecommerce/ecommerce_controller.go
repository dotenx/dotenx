package ecommerce

import (
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/dotenx/dotenx/ao-api/services/integrationService"
	"github.com/dotenx/dotenx/ao-api/services/objectstoreService"
	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/dotenx/dotenx/ao-api/services/userManagementService"
)

type EcommerceController struct {
	DatabaseService       databaseService.DatabaseService
	UserManagementService userManagementService.UserManagementService
	ProjectService        projectService.ProjectService
	ObjectstoreService    objectstoreService.ObjectstoreService
	IntegrationService    integrationService.IntegrationService
	PipelineService       crudService.CrudService
}
