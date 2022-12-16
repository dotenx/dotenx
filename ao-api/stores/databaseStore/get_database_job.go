package databaseStore

import (
	"context"
	"database/sql"
	"errors"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

var getDatabaseJob = `
SELECT * FROM database_jobs
WHERE account_id = $1 AND project_name = $2;
`

func (ds *databaseStore) GetDatabaseJob(ctx context.Context, accountId string, projectName string) (models.DatabaseJob, error) {
	var dbJob models.DatabaseJob
	conn := ds.db.Connection
	err := conn.QueryRowx(getDatabaseJob, accountId, projectName).StructScan(&dbJob)
	if err != nil {
		logrus.Error(err.Error())
		if err == sql.ErrNoRows {
			err = errors.New("not found")
		}
		return models.DatabaseJob{}, err
	}
	return dbJob, nil
}
