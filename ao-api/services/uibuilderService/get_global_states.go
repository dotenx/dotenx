package uibuilderService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (ps *uibuilderService) GetGlobalStates(accountId, projectName string) (models.GlobalState, error) {
	return ps.Store.GetGlobalStates(context.Background(), accountId, projectName)
}
