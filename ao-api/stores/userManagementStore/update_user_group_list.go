package userManagementStore

import (
	"encoding/json"
	"fmt"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (store *userManagementStore) UpdateUserGroupList(db *dbPkg.DB, userGroup models.UserGroup) (err error) {
	var stmt string
	switch db.Driver {
	case dbPkg.Postgres:
		stmt = updateUserGroupList
	default:
		return fmt.Errorf("driver not supported")
	}

	ins, _ := json.Marshal(userGroup.Insert)
	del, _ := json.Marshal(userGroup.Delete)
	upd, _ := json.Marshal(userGroup.Update)
	sel, _ := json.Marshal(userGroup.Select)

	_, err = db.Connection.Exec(stmt, userGroup.Name, ins, del, upd, sel, userGroup.Description, userGroup.IsDefault)
	if err != nil {
		return err
	}
	return
}

var updateUserGroupList = `
UPDATE user_group
SET insert_list = $2, delete_list = $3, update_list = $4, select_list = $5, description = $6, is_default = $7
WHERE name = $1
`
