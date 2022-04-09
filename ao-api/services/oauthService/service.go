package oauthService

import (
	"github.com/dotenx/dotenx/ao-api/stores/authorStore"
)

type OauthService interface {
}

type OauthManager struct {
	AuthorStore authorStore.AuthorStore
}

func NewutopiopsService(store authorStore.AuthorStore) OauthService {
	return &OauthManager{AuthorStore: store}
}
