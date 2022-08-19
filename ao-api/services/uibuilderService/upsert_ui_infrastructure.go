package uibuilderService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *uibuilderService) UpsertUiInfrastructure(uiInfra models.UiInfrastructure) error {
	return ps.Store.UpsertUiInfrastructure(context.Background(), uiInfra)
}
