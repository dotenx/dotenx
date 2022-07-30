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
	GetTotalUsage(accountId string) (int, error)
	AddObject(objectstore models.Objectstore) error
	ListFiles(accountId, projectTag string) ([]models.Objectstore, error)
}

type objectstoreService struct {
	Store objectstoreStore.ObjectstoreStore
}

var noContext = context.Background()
