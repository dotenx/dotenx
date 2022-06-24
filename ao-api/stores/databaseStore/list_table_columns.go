package databaseStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
)

var listColumns = `
SELECT column_name
FROM   information_schema.columns
WHERE  table_schema = 'public'
AND 	table_name = $1
`

func (ds *databaseStore) ListTableColumns(ctx context.Context, accountId string, projectName string, tableName string) ([]string, error) {
	db, fn, err := dbutil.GetDbInstance(accountId, projectName)
	defer fn(db.Connection)
	if err != nil {
		log.Println("Error getting database connection:", err)
		return []string{}, err
	}

	columns := make([]string, 0)
	conn := db.Connection
	rows, err := conn.Queryx(listColumns, tableName)
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
			return columns, err
		}
		columns = append(columns, cur)
	}
	return columns, nil
}
