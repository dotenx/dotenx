package databaseStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
)

type PgColumn struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

var listColumns = `
SELECT column_name, data_type
FROM   information_schema.columns
WHERE  table_schema = 'public'
AND    table_name = $1
`

func (ds *databaseStore) ListTableColumns(ctx context.Context, accountId string, projectName string, tableName string) ([]PgColumn, error) {
	db, fn, err := dbutil.GetDbInstance(accountId, projectName)
	defer fn(db.Connection)
	if err != nil {
		log.Println("Error getting database connection:", err)
		return []PgColumn{}, err
	}

	columns := make([]PgColumn, 0)
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
		var cur PgColumn
		rows.Scan(&cur.Name, &cur.Type)
		if err != nil {
			return columns, err
		}
		columns = append(columns, cur)
	}
	return columns, nil
}
