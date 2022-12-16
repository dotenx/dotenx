package uibuilderService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *uibuilderService) GetPage(accountId, projectTag, pageName string) (models.UIPage, error) {
	return ps.Store.GetPage(context.Background(), accountId, projectTag, pageName)
}
