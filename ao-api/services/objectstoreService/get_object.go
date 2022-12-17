package objectstoreService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *objectstoreService) GetObject(accountId, projectTag, fileName string) (models.Objectstore, error) {
	return ps.Store.GetObject(context.Background(), accountId, projectTag, fileName)
}
