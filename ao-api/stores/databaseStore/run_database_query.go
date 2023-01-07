package databaseStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
)

func (ds *databaseStore) RunDatabaseQuery(ctx context.Context, projectTag string, query string) (map[string]interface{}, error) {
	// Find the account_id and project_name for the project with the given tag to find the database name
	var res struct {
		AccountId   string `db:"account_id"`
		ProjectName string `db:"name"`
	}
	err := ds.db.Connection.QueryRowx(findProjectDatabase, projectTag).StructScan(&res)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("database not found")
		}
		fmt.Println("error:", err)
		return nil, err
	}
	db, fn, err := dbutil.GetDbInstance(res.AccountId, res.ProjectName)
	if db != nil {
		defer fn(db.Connection)
	}
	if err != nil {
		log.Println("Error getting database connection:", err)
		return nil, err
	}

	results, err := db.Connection.Query(query)
	if err != nil {
		return nil, err
	}
	rows := make([]interface{}, 0)
	defer results.Close()
	for results.Next() {
		var row interface{}
		if err := results.Scan(&row); err != nil {
			return nil, err
		}
		rows = append(rows, row)
	}
	return map[string]interface{}{
		"rows":       rows,
		"total_rows": len(rows),
		"successful": err == nil,
	}, nil
}
