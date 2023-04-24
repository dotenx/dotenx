package uibuilderService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

func (ps *uibuilderService) UpsertPage(page models.UIPage) error {
	hasAccess, err := ps.CheckUpsertUiPageAccess(page.AccountId, page.ProjectTag, page.Name)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	if !hasAccess {
		return utils.ErrReachLimitationOfPlan
	}

	err = ps.Store.AddPageHistory(noContext, models.UIPageHistory{
		Name:       page.Name,
		AccountId:  page.AccountId,
		ProjectTag: page.ProjectTag,
		Content:    page.Content,
	})
	if err != nil {
		return err
	}

	return ps.Store.UpsertPage(context.Background(), page)
}
