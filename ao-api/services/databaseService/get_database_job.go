package databaseService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ds *databaseService) GetDatabaseJob(accountId string, projectName string) (models.DatabaseJob, error) {
	noContext := context.Background()
	return ds.Store.GetDatabaseJob(noContext, accountId, projectName)
}
