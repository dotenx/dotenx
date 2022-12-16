package databaseStore

import (
	"context"
	"errors"

	"github.com/dotenx/dotenx/ao-api/db"
)

var setPgDumpJobStatus = `
UPDATE database_jobs
SET pg_dump_status = $1
WHERE account_id = $2 AND project_name = $3;
`

var setCsvJobStatus = `
UPDATE database_jobs
SET csv_status = $1
WHERE account_id = $2 AND project_name = $3;
`

func (ds *databaseStore) SetDatabaseJobStatus(ctx context.Context, accountId, projectName, jobType, status string) error {
	var stmt string
	switch ds.db.Driver {
	case db.Postgres:

	default:
		return errors.New("driver not supported")
	}
	switch jobType {
	case "pg_dump":
		stmt = setPgDumpJobStatus
	case "csv":
		stmt = setCsvJobStatus
	default:
		return errors.New("invalid job type")
	}
	res, err := ds.db.Connection.Exec(stmt, status, accountId, projectName)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return errors.New("failed to add database job")
	}
	return nil
}
