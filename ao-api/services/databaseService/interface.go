package databaseService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/services/userManagementService"
	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
)

type DatabaseService interface {
	AddTable(accountId string, projectName string, tableName string, isPublic bool) error
	DeleteTable(accountId string, projectName string, tableName string) error
	IsTablePublic(projectTag string, tableName string) (bool, error)
	SetTableAccess(accountId, projectName, tableName string, isPublic bool) error
	AddTableColumn(accountId string, projectName string, tableName string, columnName string, columnType string) error
	DeleteTableColumn(accountId string, projectName string, tableName string, columnName string) error
	GetTablesList(accountId string, projectName string) ([]string, error)
	ListTableColumns(accountId string, projectName string, tableName string) ([]models.PgColumn, error)

	DeleteDatabase(accountId string, projectName string) error
	DeleteDatabaseUser(accountId string, projectName string) error

	InsertRow(tpAccountId string, projectTag string, tableName string, row map[string]interface{}) error
	UpdateRow(tpAccountId string, projectTag string, tableName string, id int, row map[string]interface{}) error
	DeleteRow(tpAccountId string, projectTag string, tableName string, id int, filters databaseStore.ConditionGroup) error
	SelectRows(tpAccountId string, projectTag string, tableName string, columns []string, functions []databaseStore.Function, filters databaseStore.ConditionGroup, page int, size int) (map[string]interface{}, error)
	SelectRowById(tpAccountId string, projectTag string, tableName string, id int) (map[string]interface{}, error)

	UpsertView(accountId string, projectName string, viewName string, tableName string, columns []string, filters databaseStore.ConditionGroup, jsonQuery map[string]interface{}, isPublic bool) error
	GetViewsList(accountId string, projectName string) ([]models.DatabaseView, error)
	GetViewDetails(accountId string, projectName string, viewName string) (models.DatabaseView, error)
	DeleteView(accountId string, projectName string, viewName string) error
	RunViewQuery(tpAccountId string, projectTag string, viewName string, page int, size int) (map[string]interface{}, error)
	IsViewPublic(projectTag string, viewName string) (bool, error)
}

func NewDatabaseService(store databaseStore.DatabaseStore, userMgService userManagementService.UserManagementService) DatabaseService {
	return &databaseService{Store: store, UserManagementService: userMgService}
}

type databaseService struct {
	Store                 databaseStore.DatabaseStore
	UserManagementService userManagementService.UserManagementService
	// ProjectStore projectStore.ProjectStore
}

var noContext = context.Background()
