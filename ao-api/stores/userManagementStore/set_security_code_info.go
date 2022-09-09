package userManagementStore

import (
	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (s *userManagementStore) SetSecurityCodeInfo(db *dbPkg.DB, securityCode models.SecurityCode) (err error) {
	_, err = db.Connection.Exec(setSecurityCodeInfoStmt, securityCode.Email, securityCode.SecurityCode,
		securityCode.ExpirationTime, securityCode.Usable, securityCode.UseCase)
	return
}

var setSecurityCodeInfoStmt = `
INSERT INTO security_code (email, security_code, expiration_time, usable, use_case)
VALUES ($1, $2, $3, $4, $5)
`
