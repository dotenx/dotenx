package utopiopsService

import (
	"github.com/dotenx/dotenx/ao-api/stores/authorStore"
)

type UtopiopsService interface {
	IncrementUsedTimes(author, Type, name string) error
}

type UtopiopsManager struct {
	AuthorStore authorStore.AuthorStore
}

func NewutopiopsService(store authorStore.AuthorStore) UtopiopsService {
	return &UtopiopsManager{AuthorStore: store}
}

// @Title IncrementUsedTimes is used to increment the used times of a task or trigger
func (manager *UtopiopsManager) IncrementUsedTimes(author, Type, name string) error {
	return manager.AuthorStore.IncrementUsedTimes(author, Type, name)
}
