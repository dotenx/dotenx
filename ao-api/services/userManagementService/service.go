package userManagementService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/stores/userManagementStore"
)

func NewUserManagementService(store userManagementStore.UserManagementStore) UserManagementService {
	return &userManagementService{Store: store}
}

type UserManagementService interface {
	GetUserInfo(email string) (user *models.ThirdUser, err error)
	SetUserInfo(userInfo models.ThirdUser) (err error)
	UpdateUserInfo(userInfo models.ThirdUser) (err error)
	UpdatePassword(userInfo models.ThirdUser) (err error)
	DeleteUserInfo(email string) (err error)
}

type userManagementService struct {
	Store userManagementStore.UserManagementStore
}

var noContext = context.Background()
