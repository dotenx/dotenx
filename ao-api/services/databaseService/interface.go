package databaseService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
)

type DatabaseService interface {
	AddTable(accountId string, projectName string, tableName string) error
	DeleteTable(accountId string, projectName string, tableName string) error
	AddTableColumn(accountId string, projectName string, tableName string, columnName string, columnType string) error
	DeleteTableColumn(accountId string, projectName string, tableName string, columnName string) error
	GetTablesList(accountId string, projectName string) ([]string, error)
	ListTableColumns(accountId string, projectName string, tableName string) ([]string, error)

	InsertRow(projectTag string, tableName string, row map[string]string) error
	UpdateRow(projectTag string, tableName string, id int, row map[string]string) error
	DeleteRow(projectTag string, tableName string, id int) error
	SelectRows(projectTag string, tableName string, columns []string, page int, size int) ([]map[string]interface{}, error)
}

func NewDatabaseService(store databaseStore.DatabaseStore) DatabaseService {
	return &databaseService{Store: store}
}

type databaseService struct {
	Store databaseStore.DatabaseStore
	// ProjectStore projectStore.ProjectStore
}

var noContext = context.Background()
