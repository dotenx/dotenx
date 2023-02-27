package databaseStore

import (
	"context"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func New(db *dbPkg.DB) DatabaseStore {
	return &databaseStore{db}
}

type DatabaseStore interface {
	AddTable(ctx context.Context, db *dbPkg.DB, accountId string, projectName string, tableName string, isPublic, isWritePublic bool) error
	DeleteTable(ctx context.Context, accountId string, projectName string, tableName string) error
	IsTablePublic(ctx context.Context, projectTag string, tableName string) (bool, error)
	IsWriteToTablePublic(ctx context.Context, projectTag string, tableName string) (bool, error)
	SetTableAccess(ctx context.Context, accountId, projectName, tableName string, isPublic bool) error
	SetWriteToTableAccess(ctx context.Context, accountId, projectName, tableName string, isWritePublic bool) error
	AddTableColumn(ctx context.Context, db *dbPkg.DB, accountId string, projectName string, tableName string, columnName string, columnType string) error
	DeleteTableColumn(ctx context.Context, accountId string, projectName string, tableName string, columnName string) error
	GetTablesList(ctx context.Context, accountId string, projectName string) ([]string, error)
	ListTableColumns(ctx context.Context, accountId string, projectName string, tableName string) ([]models.PgColumn, error)
	RunDatabaseQuery(ctx context.Context, projectTag string, query string) (map[string]interface{}, error)

	DeleteDatabase(ctx context.Context, accountId string, projectName string) error
	DeleteDatabaseUser(ctx context.Context, accountId string, projectName string) error

	InsertRow(ctx context.Context, projectTag string, tableName string, row map[string]interface{}) error
	UpdateRow(ctx context.Context, useRowLevelSecurity bool, tpAccountId, projectTag string, tableName string, id int, row map[string]interface{}) error
	DeleteRow(ctx context.Context, useRowLevelSecurity bool, tpAccountId, projectTag string, tableName string, id int, filters ConditionGroup) error
	SelectRows(ctx context.Context, useRowLevelSecurity bool, tpAccountId, projectTag string, tableName string, columns []string, functions []Function, filters ConditionGroup, offset int, size int) (map[string]interface{}, error)
	SelectRowById(ctx context.Context, useRowLevelSecurity bool, tpAccountId, projectTag string, tableName string, id int) (map[string]interface{}, error)

	CreateViewsTable(db *dbPkg.DB) (err error)
	DeleteView(ctx context.Context, accountId string, projectName string, viewName string) error
	GetViewsList(ctx context.Context, accountId string, projectName string) ([]models.DatabaseView, error)
	GetViewDetails(ctx context.Context, accountId string, projectName string, viewName string) (models.DatabaseView, error)
	GetViewDetailsByProjectTag(ctx context.Context, projectTag string, viewName string) (models.DatabaseView, error)
	UpsertView(ctx context.Context, accountId string, projectName string, viewName string, tableName string, columns []string, filters ConditionGroup, jsonQuery map[string]interface{}, isPublic bool) error
	RunViewQuery(ctx context.Context, useRowLevelSecurity bool, tpAccountId, projectTag string, viewName string, offset int, limit int) (map[string]interface{}, error)
	IsViewPublic(ctx context.Context, projectTag string, viewName string) (bool, error)

	AddDatabaseJob(ctx context.Context, dbJob models.DatabaseJob) error
	SetDatabaseJobStatus(ctx context.Context, accountId, projectName, jobType, status string) error
	GetDatabaseJob(ctx context.Context, accountId string, projectName string) (models.DatabaseJob, error)
}

type databaseStore struct {
	db *dbPkg.DB
}
