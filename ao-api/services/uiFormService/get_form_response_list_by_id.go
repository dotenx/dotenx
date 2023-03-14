package uiFormService

import "github.com/dotenx/dotenx/ao-api/models"

func (uf *uiFormService) GetFormResponseListById(projectTag, pageName, formId string) ([]models.UIForm, error) {
	return uf.Store.GetFormResponseListById(noContext, projectTag, pageName, formId)
}
