package databaseStore

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	dbPkg "github.com/dotenx/dotenx/ao-api/db"
)

var addTable = `
CREATE TABLE IF NOT EXISTS %s (
	id SERIAL PRIMARY KEY,
	creator_id VARCHAR(64)
)
`

var addCommentToTable = `
COMMENT ON TABLE %s IS '%s';
`

func (ds *databaseStore) AddTable(ctx context.Context, db *dbPkg.DB, accountId string, projectName string, tableName string, isPublic, isWritePublic bool) error {

	_, err := db.Connection.Exec(fmt.Sprintf(addTable, tableName))
	if err != nil {
		log.Println("Error creating table:", err)
		return err
	}

	commentJson := make(map[string]interface{})
	if isPublic {
		commentJson["isPublic"] = true
	} else {
		commentJson["isPublic"] = false
	}
	if isWritePublic {
		commentJson["isWritePublic"] = true
	} else {
		commentJson["isWritePublic"] = false
	}
	commentBytes, err := json.Marshal(commentJson)
	if err != nil {
		return err
	}

	// if isPublic {
	_, err = db.Connection.Exec(fmt.Sprintf(addCommentToTable, tableName, string(commentBytes)))
	if err != nil {
		log.Println("Error creating table:", err)
		return err
	}
	// } else {
	// 	_, err = db.Connection.Exec(fmt.Sprintf(addCommentToTable, tableName, "'{\"isPublic\": false}'"))
	// 	if err != nil {
	// 		log.Println("Error creating table:", err)
	// 		return err
	// 	}
	// }
	log.Println("Table created:", tableName)
	return nil
}
