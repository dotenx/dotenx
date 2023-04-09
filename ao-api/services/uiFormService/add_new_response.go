package uiFormService

import (
	"errors"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

func (uf *uiFormService) AddNewResponse(form models.UIForm, accountId, projectType string) error {
	if form.Response == nil {
		return errors.New("invalid response")
	}

	hasAccess, err := uf.CheckAddFormResponseAccess(accountId, projectType)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	if !hasAccess {
		return utils.ErrReachLimitationOfPlan
	}

	return uf.Store.AddNewResponse(noContext, form)
}
