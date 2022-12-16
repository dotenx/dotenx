package databaseService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ds *databaseService) GetViewDetails(accountId string, projectName string, viewName string) (models.DatabaseView, error) {
	noContext := context.Background()
	viewDetails, err := ds.Store.GetViewDetails(noContext, accountId, projectName, viewName)
	if err != nil {
		return models.DatabaseView{}, err
	}
	viewDetails.Query = ""
	viewDetails.Values = make(map[string]interface{})
	return viewDetails, err
}
