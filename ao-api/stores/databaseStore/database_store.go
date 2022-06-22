package databaseStore

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db"
)

func New(db *db.DB) DatabaseStore {
	return &databaseStore{db}
}

type DatabaseStore interface {
	AddTable(ctx context.Context, accountId string, projectName string, tableName string) error
	DeleteTable(ctx context.Context, accountId string, projectName string, tableName string) error
	AddTableColumn(ctx context.Context, accountId string, projectName string, tableName string, columnName string, columnType string) error
	DeleteTableColumn(ctx context.Context, accountId string, projectName string, tableName string, columnName string) error
	GetTablesList(ctx context.Context, accountId string, projectName string) ([]string, error)
}

type databaseStore struct {
	db *db.DB
}
