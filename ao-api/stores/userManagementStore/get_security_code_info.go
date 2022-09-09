package userManagementStore

import (
	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (s *userManagementStore) GetSecurityCodeInfo(db *dbPkg.DB, securityCodeStr, useCase string) (securityCode models.SecurityCode, err error) {
	err = db.Connection.QueryRowx(getSecurityCodeInfoStmt, securityCodeStr, useCase).StructScan(&securityCode)
	return
}

var getSecurityCodeInfoStmt = `
SELECT *
FROM security_code
WHERE security_code = $1 and use_case = $2
`
