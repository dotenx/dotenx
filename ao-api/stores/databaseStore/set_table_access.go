package databaseStore

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/sirupsen/logrus"
)

func (ds *databaseStore) SetTableAccess(ctx context.Context, accountId, projectName, tableName string, isPublic bool) error {
	db, fn, err := dbutil.GetDbInstance(accountId, projectName)

	if db != nil {
		defer fn(db.Connection)
	}
	if err != nil {
		logrus.Error("Error getting database connection:", err.Error())
		return err
	}

	var comment string
	err = db.Connection.QueryRow(fmt.Sprintf(getCommentsOfTable, tableName)).Scan(&comment)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	logrus.Info("comments of table:", comment)
	var commentMap map[string]interface{}
	err = json.Unmarshal([]byte(comment), &commentMap)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	if isPublic {
		commentMap["isPublic"] = true
	} else {
		commentMap["isPublic"] = false
	}
	commentBytes, err := json.Marshal(commentMap)
	if err != nil {
		return err
	}

	// if isPublic {
	_, err = db.Connection.Exec(fmt.Sprintf(addCommentToTable, tableName, string(commentBytes)))
	if err != nil {
		logrus.Error("Error changing table access:", err.Error())
		return err
	}
	// } else {
	// 	_, err = db.Connection.Exec(fmt.Sprintf(addCommentToTable, tableName, "'{\"isPublic\": false}'"))
	// 	if err != nil {
	// 		logrus.Error("Error changing table access:", err.Error())
	// 		return err
	// 	}
	// }
	return nil
}
