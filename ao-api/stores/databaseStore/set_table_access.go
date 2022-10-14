package databaseStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/sirupsen/logrus"
)

func (ds *databaseStore) SetTableAccess(ctx context.Context, accountId, projectName, tableName string, isPublic bool) error {
	db, fn, err := dbutil.GetDbInstance(accountId, projectName)

	defer fn(db.Connection)
	if err != nil {
		logrus.Error("Error getting database connection:", err.Error())
		return err
	}
	if isPublic {
		_, err = db.Connection.Exec(fmt.Sprintf(addCommentToTable, tableName, "'{\"isPublic\": true}'"))
		if err != nil {
			logrus.Error("Error changing table access:", err.Error())
			return err
		}
	} else {
		_, err = db.Connection.Exec(fmt.Sprintf(addCommentToTable, tableName, "'{\"isPublic\": false}'"))
		if err != nil {
			logrus.Error("Error changing table access:", err.Error())
			return err
		}
	}
	return nil
}
