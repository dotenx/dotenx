package userManagement

import (
	"github.com/dotenx/dotenx/ao-api/services/oauthService"
	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/dotenx/dotenx/ao-api/services/userManagementService"
	"golang.org/x/crypto/bcrypt"
)

type UserManagementController struct {
	Service        userManagementService.UserManagementService
	ProjectService projectService.ProjectService
	OauthService   oauthService.OauthService
}

// Authenticate function checks equality of password that is in the body of the request and hashed password that is saved in database
func Authenticate(reqPassword string, dbPassword string) bool {

	if err := bcrypt.CompareHashAndPassword([]byte(dbPassword), []byte(reqPassword)); err != nil {
		return false
	}
	return true
}
