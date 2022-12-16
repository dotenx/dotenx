package databaseService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ds *databaseService) GetViewsList(accountId string, projectName string) ([]models.DatabaseView, error) {
	noContext := context.Background()
	return ds.Store.GetViewsList(noContext, accountId, projectName)
}
