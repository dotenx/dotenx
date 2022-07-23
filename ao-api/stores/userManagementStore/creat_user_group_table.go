package userManagementStore

import (
	"fmt"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
)

func (store *userManagementStore) CreateUserGroupTable(db *dbPkg.DB) (err error) {
	var stmt string
	switch db.Driver {
	case dbPkg.Postgres:
		stmt = createUserGroupTableStmt
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err = db.Connection.Exec(stmt)
	if err != nil {
		return err
	}
	_, err = db.Connection.Exec(inserUsersUserGroup)
	if err != nil {
		return err
	}
	_, err = db.Connection.Exec(insertReadersUserGroup)
	if err != nil {
		return err
	}
	_, err = db.Connection.Exec(insertEditorsUserGroup)
	if err != nil {
		return err
	}
	_, err = db.Connection.Exec(insertWritersUserGroup)
	if err != nil {
		return err
	}
	return
}

var createUserGroupTableStmt = `
CREATE TABLE IF NOT EXISTS user_group (
name                       VARCHAR(128) PRIMARY KEY,
insert_list                JSONB,
delete_list                JSONB,
update_list                JSONB,
select_list                JSONB,
description                VARCHAR(1024),
is_default				 BOOLEAN
)
`
var inserUsersUserGroup = `
INSERT INTO user_group (name, insert_list, delete_list, update_list, select_list, description, is_default)
VALUES ('users', null, null, null, null, 'users user group does'nt grant any privilage on any table', true)
`

var insertWritersUserGroup = `
INSERT INTO user_group (name, insert_list, delete_list, update_list, select_list)
VALUES ('writers',null, ' {
        "*": "*"
    }', ' {
        "*": "*"
    }', ' {
        "*": "*"
    }', 'writers user group grants all privilages on all tables', false)
`

var insertReadersUserGroup = `
INSERT INTO user_group (name, insert_list, delete_list, update_list, select_list)
VALUES ('readers', null, null, null, ' {
        "*": "*"
    }', 'readers user group grants select on all tables', false)
`
var insertEditorsUserGroup = `
INSERT INTO user_group (name, insert_list, delete_list, update_list, select_list)
VALUES ('editors', null, null, ' {
        "*": "*"
    }', ' {
        "*": "*"
    }', 'editors user group grants select and update on all tables', false)
`
