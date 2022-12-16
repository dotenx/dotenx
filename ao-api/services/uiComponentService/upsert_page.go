package uiComponentService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *uiComponentService) UpsertComponent(page models.UIComponent) error {
	return ps.Store.UpsertComponent(context.Background(), page)
}
