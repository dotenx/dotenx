package databaseStore

import (
	"context"
	"database/sql"
	"errors"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

var getDatabaseUserStmt = `
select * from database_user
where account_id = $1 and project_name = $2;
`

func (ds *databaseStore) GetDatabaseUser(ctx context.Context, accountId string, projectName string) (models.DatabaseUser, error) {
	var dbUser models.DatabaseUser
	conn := ds.db.Connection
	err := conn.QueryRowx(getDatabaseUserStmt, accountId, projectName).StructScan(&dbUser)
	if err != nil {
		logrus.Error(err.Error())
		if err == sql.ErrNoRows {
			err = errors.New("not found")
		}
		return models.DatabaseUser{}, err
	}
	return dbUser, nil
}
