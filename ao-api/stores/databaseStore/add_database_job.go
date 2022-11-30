package databaseStore

import (
	"context"
	"errors"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

var addDatabaseJob = `
INSERT INTO database_jobs(account_id, project_name, pg_dump_url, pg_dump_url_expiration_time)
VALUES ($1, $2, $3, $4);
`

func (ds *databaseStore) AddDatabaseJob(ctx context.Context, dbJob models.DatabaseJob) error {
	var stmt string
	switch ds.db.Driver {
	case db.Postgres:
		stmt = addDatabaseJob
	default:
		return errors.New("driver not supported")
	}
	res, err := ds.db.Connection.Exec(stmt, dbJob.AccountId, dbJob.ProjectName, dbJob.PgDumpUrl, dbJob.PgDumpUrlExpirationTime)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return errors.New("failed to add database job")
	}
	return nil
}
