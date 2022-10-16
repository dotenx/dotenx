package uibuilderService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *uibuilderService) UpsertGlobalStates(globalState models.GlobalState) error {
	return ps.Store.UpsertGlobalStates(context.Background(), globalState)
}
