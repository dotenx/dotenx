package uiComponentService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *uiComponentService) ListComponents(accountId, projectTag string) ([]models.UIComponent, error) {
	return ps.Store.ListComponents(context.Background(), accountId, projectTag)
}
