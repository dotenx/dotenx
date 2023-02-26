package uiFormService

import (
	"errors"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (uf *uiFormService) AddNewResponse(form models.UIForm) error {
	if form.Response == nil {
		return errors.New("invalid response")
	}
	return uf.Store.AddNewResponse(noContext, form)
}
