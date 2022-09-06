package uiComponentService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *uiComponentService) GetUiInfrastructure(accountId, projectTag string) (models.UiInfrastructure, error) {
	return ps.Store.GetUiInfrastructure(context.Background(), accountId, projectTag)
}
