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
}

func NewDatabaseService(store databaseStore.DatabaseStore) DatabaseService {
	return &databaseService{Store: store}
}

type databaseService struct {
	Store databaseStore.DatabaseStore
}

var noContext = context.Background()
