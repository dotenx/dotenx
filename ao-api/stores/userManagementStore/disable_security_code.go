package userManagementStore

import dbPkg "github.com/dotenx/dotenx/ao-api/db"

func (s *userManagementStore) DisableSecurityCode(db *dbPkg.DB, securityCode, useCase string) (err error) {
	_, err = db.Connection.Exec(disableSecurityCodeStmt, securityCode, useCase)
	return
}

var disableSecurityCodeStmt = `
UPDATE security_code
SET usable = false
WHERE security_code = $1 and use_case = $2
`
