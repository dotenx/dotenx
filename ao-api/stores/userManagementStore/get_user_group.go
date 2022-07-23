package userManagementStore

import (
	"encoding/json"
	"fmt"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (store *userManagementStore) GetUserGroup(db *dbPkg.DB, name string) (user *models.UserGroup, err error) {
	res := models.UserGroup{}
	var stmt string
	switch db.Driver {
	case dbPkg.Postgres:
		stmt = selectUserGroup
	default:
		return &res, fmt.Errorf("driver not supported")
	}
	row := db.Connection.QueryRowx(stmt, name)
	if row == nil {
		return &res, fmt.Errorf("no yser group with this name")
	}
	var ins, sel, upd, del []byte
	row.Scan(&ins, &sel, &upd, &del, &res.Description, &res.IsDefault)
	json.Unmarshal(ins, &res.Insert)
	json.Unmarshal(sel, &res.Select)
	json.Unmarshal(upd, &res.Update)
	json.Unmarshal(del, &res.Delete)
	return &res, nil
}

var selectUserGroup = `
SELECT insert_list, select_list, update_list, delete_list, description, is_default from user_group where name = $1`
