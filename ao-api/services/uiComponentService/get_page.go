package uiComponentService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *uiComponentService) GetComponent(accountId, projectTag, pageName string) (models.UIComponent, error) {
	return ps.Store.GetComponent(context.Background(), accountId, projectTag, pageName)
}
