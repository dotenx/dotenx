package projectStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

var createDatabaseUser = `
create user %s with encrypted password '%s';
`

var insertToDatabaseUserTable = `
insert into database_user (account_id, project_name, username, password)
values ($1, $2, $3, $4);
`

var grantAccessToUser = `
grant all privileges on database %s to %s;
`

func (store *projectStore) CreateDbUserAndGrantAccess(ctx context.Context, accountId string, projectName string) error {
	var createUserStmt, insertToDbUserStmt, grantAccessStmt string
	switch store.db.Driver {
	case db.Postgres:
		createUserStmt = createDatabaseUser
		insertToDbUserStmt = insertToDatabaseUserTable
		grantAccessStmt = grantAccessToUser
	default:
		return fmt.Errorf("driver not supported")
	}
	username := "db_user_" + utils.RandStringRunes(16, utils.LowercaseRunes)
	encryptedUsername, err := utils.Encrypt(username, config.Configs.Secrets.Encryption)
	if err != nil {
		return err
	}
	password := utils.RandStringRunes(32, utils.FullRunes)
	encryptedPassword, err := utils.Encrypt(password, config.Configs.Secrets.Encryption)
	if err != nil {
		return err
	}
	_, err = store.db.Connection.Exec(fmt.Sprintf(createUserStmt, username, password))
	if err != nil {
		fmt.Println("Error creating project database:", err)
		return err
	}
	_, err = store.db.Connection.Exec(insertToDbUserStmt, accountId, projectName, encryptedUsername, encryptedPassword)
	if err != nil {
		fmt.Println("Error creating project database:", err)
		return err
	}
	_, err = store.db.Connection.Exec(fmt.Sprintf(grantAccessStmt, utils.GetProjectDatabaseName(accountId, projectName), username))
	if err != nil {
		fmt.Println("Error creating project database:", err)
		return err
	}
	return nil
}
