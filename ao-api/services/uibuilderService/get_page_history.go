package uibuilderService

import (
	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *uibuilderService) GetPageHistory(accountId, projectTag, pageName string) ([]models.UIPageHistory, error) {
	return ps.Store.GetPageHistory(noContext, accountId, projectTag, pageName)
}
