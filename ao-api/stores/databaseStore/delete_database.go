package databaseStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

var dropDatabase = `
DROP DATABASE %s;
`

// DeleteDatabase drops database that is corresponding to project
func (ds *databaseStore) DeleteDatabase(ctx context.Context, accountId string, projectName string) error {

	var stmt string
	switch ds.db.Driver {
	case db.Postgres:
		stmt = fmt.Sprintf(dropDatabase, utils.GetProjectDatabaseName(accountId, projectName))
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err := ds.db.Connection.Exec(stmt)
	if err != nil {
		logrus.Error("Error droping database:", err)
		return err
	}
	return nil
}
