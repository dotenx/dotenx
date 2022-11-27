package databaseStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/dotenx/dotenx/ao-api/models"
)

var listColumns = `
SELECT column_name, domain_name
FROM   information_schema.columns
WHERE  table_schema = 'public'
AND    table_name = $1
`

func (ds *databaseStore) ListTableColumns(ctx context.Context, accountId string, projectName string, tableName string) ([]models.PgColumn, error) {
	db, fn, err := dbutil.GetDbInstance(accountId, projectName)
	if db != nil {
		defer fn(db.Connection)
	}
	if err != nil {
		log.Println("Error getting database connection:", err)
		return []models.PgColumn{}, err
	}

	columns := make([]models.PgColumn, 0)
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
		var cur models.PgColumn
		// TODO: id column hasn't domain_name (domain_name is null because this column not created by user)
		// so we should handle sql null error for this column
		rows.Scan(&cur.Name, &cur.Type)
		if err != nil {
			return columns, err
		}
		if cur.Name == "id" {
			cur.Type = "num"
		}
		if cur.Name == "creator_id" {
			cur.Type = "short_text"
		}
		columns = append(columns, cur)
	}
	return columns, nil
}
