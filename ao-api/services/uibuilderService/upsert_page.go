package uibuilderService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *uibuilderService) UpsertPage(page models.UIPage) error {
	return ps.Store.UpsertPage(context.Background(), page)
}
