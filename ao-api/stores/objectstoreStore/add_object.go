package objectstoreStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (ds *objectstoreStore) AddObject(ctx context.Context, objectstore models.Objectstore) error {
	addObject := `
INSERT INTO object_store (key, account_id, tpaccount_id, project_tag, size, access, url)
VALUES ($1, $2, $3, $4, $5, $6, $7)
`
	var stmt string
	switch ds.db.Driver {
	case db.Postgres:
		stmt = addObject
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err := ds.db.Connection.Exec(stmt, objectstore.Key, objectstore.AccountId, objectstore.TpAccountId, objectstore.ProjectTag, objectstore.Size, objectstore.Access, objectstore.Url)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	return nil
}
