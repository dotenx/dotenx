package userManagementStore

import (
	"encoding/json"
	"fmt"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (store *userManagementStore) CreateUserGroup(db *dbPkg.DB, userGroup models.UserGroup) (err error) {
	var stmt string
	switch db.Driver {
	case dbPkg.Postgres:
		stmt = insertToUserGroup
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

var insertToUserGroup = `
INSERT INTO user_group (name, insert_list, delete_list, update_list, select_list, description, is_default)
VALUES ($1, $2, $3, $4, $5, $6, $7)
`
