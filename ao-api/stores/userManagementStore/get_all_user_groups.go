package userManagementStore

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (store *userManagementStore) GetAllUserGroups(db *dbPkg.DB) ([]*models.UserGroup, error) {
	res := make([]*models.UserGroup, 0)
	switch db.Driver {
	case dbPkg.Postgres:
		rows, err := db.Connection.Queryx(getAllUserGroups)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return nil, err
		}
		defer rows.Close()
		for rows.Next() {
			var cur models.UserGroup
			var ins, del, upd, sel []byte
			rows.Scan(&cur.Name, &ins, &del, &upd, &sel)
			json.Unmarshal(ins, &cur.Insert)
			json.Unmarshal(sel, &cur.Select)
			json.Unmarshal(del, &cur.Delete)
			json.Unmarshal(upd, &cur.Update)
			if err != nil {
				return nil, err
			}
			res = append(res, &cur)
		}
	}
	return res, nil
}

var getAllUserGroups = `
select name, insert_list, delete_list, update_list, select_list from user_group;`
