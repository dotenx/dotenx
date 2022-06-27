package databaseStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

// We first convert this to a parameterized query and then execute it with the values
var selectRows = `
SELECT %s 
FROM %s 
LIMIT $1 OFFSET $2
`

func (ds *databaseStore) SelectRows(ctx context.Context, projectTag string, tableName string, columns []string, offset int, limit int) ([]map[string]interface{}, error) {

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

	defer fn(db.Connection)
	if err != nil {
		log.Println("Error getting database connection:", err)
		return nil, err
	}

	tableNameStmt := tableName
	joinedTables := make([]string, 0)
	for i, _ := range columns {
		if strings.HasPrefix(columns[i], "__") {
			continue
		}
		if strings.Contains(columns[i], "__") {
			if len(strings.Split(columns[i], "__")) != 2 {
				return nil, errors.New("invalid column name")
			}
			joinTable := strings.Split(columns[i], "__")[0]
			// we should check that join each table just once so we need joinedTables slice
			if !utils.ContainsString(joinedTables, joinTable) {
				joinedTables = append(joinedTables, joinTable)
				tableNameStmt += " JOIN " + joinTable
				tableNameStmt += " ON " + "__" + joinTable + " = " + fmt.Sprintf("%s.id", joinTable)
				tableNameStmt += "\n"
			}
			// convert TABLE__FIELD to TABLE.FIELD for sql query statement
			columns[i] = strings.Replace(columns[i], "__", ".", 1) + " AS " + columns[i]
		} else {
			columns[i] = fmt.Sprintf("%s.%s", tableName, columns[i])
		}
	}

	cl := strings.TrimSuffix(strings.Join(columns, ","), ",")
	stmt := fmt.Sprintf(selectRows, cl, tableNameStmt)
	log.Println("stmt:", stmt)

	result, err := db.Connection.Query(stmt, limit, offset)

	return SelectScan(result)
}

func SelectScan(rows *sql.Rows) ([]map[string]interface{}, error) {
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return nil, err
	}
	numColumns := len(columns)

	values := make([]interface{}, numColumns)
	for i := range values {
		values[i] = new(interface{})
	}

	var results []map[string]interface{}
	for rows.Next() {
		if err := rows.Scan(values...); err != nil {
			return nil, err
		}

		dest := make(map[string]interface{}, numColumns)
		for i, column := range columns {
			dest[column] = *(values[i].(*interface{}))
		}
		results = append(results, dest)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return results, nil
}
