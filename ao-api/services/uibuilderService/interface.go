package uibuilderService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/stores/uibuilderStore"
)

func NewUIbuilderService(store uibuilderStore.UIbuilderStore) UIbuilderService {
	return &uibuilderService{Store: store}
}

type UIbuilderService interface {
	UpsertPage(page models.UIPage) error
	DeletePage(accountId, projectTag, pageName string) error
	ListPages(accountId, projectTag string) ([]string, error)
	GetPage(accountId, projectTag, pageName string) (models.UIPage, error)
	SetPageStatus(accountId, projectTag, pageName, status string) error
	GetUiInfrastructure(accountId, projectTag string) (models.UiInfrastructure, error)
	UpsertUiInfrastructure(uiInfra models.UiInfrastructure) error
}

type uibuilderService struct {
	Store uibuilderStore.UIbuilderStore
}

var noContext = context.Background()
