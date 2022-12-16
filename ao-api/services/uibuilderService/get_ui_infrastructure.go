package uibuilderService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *uibuilderService) GetUiInfrastructure(accountId, projectTag string) (models.UiInfrastructure, error) {
	return ps.Store.GetUiInfrastructure(context.Background(), accountId, projectTag)
}
