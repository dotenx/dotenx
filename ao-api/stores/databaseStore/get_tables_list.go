package databaseStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
)

var getTables = `
SELECT table_name
FROM   information_schema.tables
WHERE  table_schema = 'public';
`

func (ds *databaseStore) GetTablesList(ctx context.Context, accountId string, projectName string) ([]string, error) {
	db, fn, err := dbutil.GetDbInstance(accountId, projectName)
	if db != nil {
		defer fn(db.Connection)
	}
	if err != nil {
		log.Println("Error getting database connection:", err)
		return []string{}, err
	}

	tables := make([]string, 0)
	conn := db.Connection
	rows, err := conn.Queryx(getTables)
	if err != nil {
		log.Println(err.Error())
		if err == sql.ErrNoRows {
			err = errors.New("not found")
		}
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var cur string
		rows.Scan(&cur)
		if err != nil {
			return tables, err
		}
		tables = append(tables, cur)
	}
	return tables, nil
}
