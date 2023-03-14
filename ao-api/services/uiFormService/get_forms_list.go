package uiFormService

import "github.com/dotenx/dotenx/ao-api/models"

func (uf *uiFormService) GetFormsList(projectTag, pageName string) ([]models.UIForm, error) {
	return uf.Store.GetFormsList(noContext, projectTag, pageName)
}
