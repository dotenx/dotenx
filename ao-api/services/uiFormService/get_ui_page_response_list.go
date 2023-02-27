package uiFormService

import (
	"github.com/dotenx/dotenx/ao-api/models"
)

func (uf *uiFormService) GetUiPageResponseList(projectTag, pageName string) ([]models.UIForm, error) {
	return uf.Store.GetUiPageResponseList(noContext, projectTag, pageName)
}
