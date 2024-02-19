package projectService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/dotenx/dotenx/ao-api/services/marketplaceService"
	"github.com/dotenx/dotenx/ao-api/services/objectstoreService"
	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
	"github.com/dotenx/dotenx/ao-api/stores/projectStore"
	"github.com/dotenx/dotenx/ao-api/stores/userManagementStore"
)

func NewProjectService(store projectStore.ProjectStore, tpUserStore userManagementStore.UserManagementStore, dbStore databaseStore.DatabaseStore) ProjectService {
	return &projectService{
		Store:       store,
		TpUserStore: tpUserStore,
		DbStore:     dbStore,
	}
}

type ProjectService interface {
	AddProject(accountId string, project models.Project, uiBuilderService uibuilderService.UIbuilderService) error
	InitialSetup(project models.Project, objService objectstoreService.ObjectstoreService) error
	ListProjects(accountId string) ([]models.Project, error)
	GetProject(accountId string, projectName string) (models.Project, error)
	GetProjectByTag(tag string) (models.Project, error)
	GetProjectDomain(accountId, projectTag string) (models.ProjectDomain, error)
	UpsertProjectDomain(projectDomain models.ProjectDomain) error
	ImportProject(accountId, newProjectName, newProjectDescription string, itemId int, mService marketplaceService.MarketplaceService, dbService databaseService.DatabaseService, cService crudService.CrudService, uiBuilderService uibuilderService.UIbuilderService) error
	CheckCreateProjectAccess(accountId, projectType string) (bool, error)
	CheckCreateDatabaseAccess(accountId string) (bool, error)
	// DeleteProject deletes a project and all its associated resources
	DeleteProject(accountId, projectTag string, ubService uibuilderService.UIbuilderService, dbService databaseService.DatabaseService, cService crudService.CrudService) error

	CheckCreateDomainAccess(accountId, projectType string) (bool, error)
	CheckDomainAvailability(domain string) (string, error)
	GetDomainPaymentLink(accountId, projectTag, domain string) (paymentLink string, err error)
	RegisterDomain(accountId, projectTag string) (awsOperationId string, err error)
	CreateEventBridgeScheduleForDomainRegistration(accountId, projectTag, domainName, operationId string) (err error)
	CreateEventBridgeRuleForCertificateIssuance(accountId, projectTag, certificateArn string) (err error)
	HandleDomainRegistration(accountId, projectTag, operationId, scheduleName string) (err error)
	HandleCertificateIssuance(certificateArnList []string) (err error)
}

type projectService struct {
	Store       projectStore.ProjectStore
	TpUserStore userManagementStore.UserManagementStore
	DbStore     databaseStore.DatabaseStore
}

var noContext = context.Background()
