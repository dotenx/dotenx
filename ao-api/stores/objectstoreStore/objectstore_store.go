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
	GetTotalUsage(ctx context.Context, accountId string) (int, error)
	AddObject(ctx context.Context, objectstore models.Objectstore) error
	ListFiles(ctx context.Context, accountId, projectTag string) ([]models.Objectstore, error)
}

type objectstoreStore struct {
	db *db.DB
}
