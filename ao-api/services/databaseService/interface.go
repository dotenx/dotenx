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
	ListTableColumns(accountId string, projectName string, tableName string) ([]databaseStore.PgColumn, error)

	InsertRow(tpAccountId string, projectTag string, tableName string, row map[string]interface{}) error
	UpdateRow(tpAccountId string, projectTag string, tableName string, id int, row map[string]interface{}) error
	DeleteRow(tpAccountId string, projectTag string, tableName string, id int) error
	SelectRows(tpAccountId string, projectTag string, tableName string, columns []string, filters databaseStore.ConditionGroup, page int, size int) ([]map[string]interface{}, error)
}

func NewDatabaseService(store databaseStore.DatabaseStore) DatabaseService {
	return &databaseService{Store: store}
}

type databaseService struct {
	Store databaseStore.DatabaseStore
	// ProjectStore projectStore.ProjectStore
}

var noContext = context.Background()
