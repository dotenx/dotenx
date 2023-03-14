package uiFormService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/stores/uiFormStore"
)

func NewUIFormService(store uiFormStore.UIFormStore) UIFormService {
	return &uiFormService{Store: store}
}

type UIFormService interface {
	AddNewResponse(form models.UIForm) error
	GetUiPageResponseList(projectTag, pageName string) ([]models.UIForm, error)
	GetNumberOfFormSubmission(projectTag, pageName string) (int64, error)
}

type uiFormService struct {
	Store uiFormStore.UIFormStore
}

var noContext = context.Background()
