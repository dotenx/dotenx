package objectstoreService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/stores/objectstoreStore"
)

func NewObjectstoreService(store objectstoreStore.ObjectstoreStore) ObjectstoreService {
	return &objectstoreService{Store: store}
}

type ObjectstoreService interface {

	// Get total usage of the object store across all projects in the account
	GetTotalUsage(accountId string) (int, error)

	// Get total usage of the object store across all projects with given type in the account
	GetUsageByProjectType(accountId, projectType string) (int64, error)

	// Add an object to the object_store table
	AddObject(objectstore models.Objectstore) error

	// Get an object from the object_store table
	GetObject(accountId, projectTag, fileName string) (models.Objectstore, error)

	// Delete a file from the object_store table. If tpAccountId is not empty, it will be included in the where clause, o.w. it will be ignored
	DeleteObject(accountId, tpAccountId, projectTag, fileName string) error

	// List all objects of a project
	ListFiles(accountId, projectTag string) ([]models.Objectstore, error)

	// Returns a public url for file based on given expiration time (in seconds)
	GetPresignUrl(accountId, projectTag, fileName, expiresIn string) (map[string]interface{}, error)

	CheckUploadFileAccess(accountId, projectType string) (bool, error)

	SetUserGroups(accountId, projectTag, fileName string, userGroups []string) error

	SetAccess(accountId, projectTag, fileName, newUrl string, isPublic bool) error
}

type objectstoreService struct {
	Store objectstoreStore.ObjectstoreStore
}

var noContext = context.Background()
