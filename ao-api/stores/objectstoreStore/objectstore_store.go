package objectstoreStore

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func New(db *db.DB) ObjectstoreStore {
	return &objectstoreStore{db}
}

type ObjectstoreStore interface {

	// Get total usage of the object store across all projects in the account
	GetTotalUsage(ctx context.Context, accountId string) (int, error)

	// Add an object to the object_store table
	AddObject(ctx context.Context, objectstore models.Objectstore) error

	// Get an object from the object_store table
	GetObject(ctx context.Context, accountId, projectTag, fileName string) (models.Objectstore, error)

	// Delete a file from the object_store table. If tpAccountId is not empty, it will be included in the where clause, o.w. it will be ignored
	DeleteObject(ctx context.Context, accountId, tpAccountId, projectTag, fileName string) error

	// List all objects of a project
	ListFiles(ctx context.Context, accountId, projectTag string) ([]models.Objectstore, error)

	// Set the user_groups field of an object
	SetUserGroups(ctx context.Context, accountId, projectTag, fileName string, userGroups []string) error

	// Set the is_public and url fields of an object
	SetAccess(ctx context.Context, accountId, projectTag, fileName, newUrl string, isPublic bool) error
}

type objectstoreStore struct {
	db *db.DB
}
