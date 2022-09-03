package databaseStore

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
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
	ListTableColumns(ctx context.Context, accountId string, projectName string, tableName string) ([]models.PgColumn, error)

	InsertRow(ctx context.Context, projectTag string, tableName string, row map[string]interface{}) error
	UpdateRow(ctx context.Context, useRowLevelSecurity bool, tpAccountId, projectTag string, tableName string, id int, row map[string]interface{}) error
	DeleteRow(ctx context.Context, useRowLevelSecurity bool, tpAccountId, projectTag string, tableName string, id int) error
	SelectRows(ctx context.Context, useRowLevelSecurity bool, tpAccountId, projectTag string, tableName string, columns []string, filters ConditionGroup, offset int, size int) ([]map[string]interface{}, error)
}

type databaseStore struct {
	db *db.DB
}
