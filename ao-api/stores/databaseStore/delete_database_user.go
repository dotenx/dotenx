package databaseStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

var getDatabaseUsername = `
SELECT username FROM database_user
WHERE account_id = $1 AND project_name = $2;
`

var dropDatabaseUser = `
DROP USER %s;
`

var deleteDatabaseUser = `
DELETE FROM database_user
WHERE account_id = $1 AND project_name = $2;
`

// DeleteDatabaseUser deletes user of project's database and also delete corresponding row of username and password in database_user table
func (ds *databaseStore) DeleteDatabaseUser(ctx context.Context, accountId string, projectName string) error {

	var encryptedUsername string
	err := ds.db.Connection.QueryRowx(getDatabaseUsername, accountId, projectName).Scan(&encryptedUsername)
	if err != nil {
		logrus.Error(err.Error())
		if err == sql.ErrNoRows {
			err = errors.New("not found")
		}
		return err
	}
	username, err := utils.Decrypt(encryptedUsername, config.Configs.Secrets.Encryption)
	if err != nil {
		return err
	}

	_, err = ds.db.Connection.Exec(fmt.Sprintf(dropDatabaseUser, username))
	if err != nil {
		logrus.Error("Error droping database user:", err)
		return err
	}
	result, err := ds.db.Connection.Exec(deleteDatabaseUser, accountId, projectName)
	if err != nil {
		logrus.Error("Error deleting database user:", err)
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil || rowsAffected == 0 {
		logrus.Error("Error deleting database user:", err)
		err = errors.New("no rows deleted, may your database user corresponding row doesn't exist")
		return err
	}
	return nil
}
