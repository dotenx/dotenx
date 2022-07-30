package objectstoreService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *objectstoreService) AddObject(objectstore models.Objectstore) error {
	return ps.Store.AddObject(context.Background(), objectstore)
}
