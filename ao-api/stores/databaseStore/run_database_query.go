package databaseStore

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/lib/pq"
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

	// Adding some limitation to user's queries
	_, err = db.Connection.Exec("SET statement_timeout = 10000;")
	if err != nil {
		return nil, err
	}

	// Execute the query
	result, err := db.Connection.Exec(query)
	if err != nil {
		return nil, err
	}

	// Determine the number of affected rows
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, err
	}

	var cnt = 0
	irows, err := db.Connection.Queryx(query)
	if err != nil {
		return nil, err
	}
	defer irows.Close()
	for irows.Next() {
		cnt++
		break
	}

	var results []map[string]interface{}
	// If the query is a SELECT statement, fetch the rows
	if cnt != 0 {
		rowsAffected = 0
		rows, err := db.Connection.Queryx(query)
		if err != nil {
			return nil, err
		}
		defer rows.Close()

		columns, err := rows.Columns()
		if err != nil {
			return nil, err
		}
		numColumns := len(columns)

		values := make([]interface{}, numColumns)
		rvalues := make([]interface{}, numColumns)
		for i := range values {
			columnTypes, _ := rows.ColumnTypes()
			columnType := columnTypes[i]
			switch columnType.DatabaseTypeName() {
			case "_TEXT":
				rvalues[i] = new([]string)
				values[i] = pq.Array(rvalues[i].(*[]string))

			case "_BOOL":
				rvalues[i] = new([]bool)
				values[i] = pq.Array(rvalues[i].(*[]bool))

			case "_INT4":
				rvalues[i] = new([]int64)
				values[i] = pq.Array(rvalues[i].(*[]int64))

			case "_FLOAT8":
				rvalues[i] = new([]float64)
				values[i] = pq.Array(rvalues[i].(*[]float64))

			case "JSON", "JSONB":
				values[i] = new([]byte)

			default:
				values[i] = new(interface{})
			}
		}

		for rows.Next() {
			if err := rows.Scan(values...); err != nil {
				return nil, err
			}

			dest := make(map[string]interface{}, numColumns)
			for i, column := range columns {
				if _, ok := rvalues[i].(*[]string); ok {
					dest[column] = *(rvalues[i].(*[]string))
				} else if _, ok := rvalues[i].(*[]bool); ok {
					dest[column] = *(rvalues[i].(*[]bool))
				} else if _, ok := rvalues[i].(*[]int64); ok {
					dest[column] = *(rvalues[i].(*[]int64))
				} else if _, ok := rvalues[i].(*[]float64); ok {
					dest[column] = *(rvalues[i].(*[]float64))
				} else if _, ok := values[i].(*[]byte); ok {
					var value jsonInterface
					json.Unmarshal(*(values[i].(*[]byte)), &value)
					dest[column] = value
				} else {
					dest[column] = *(values[i].(*interface{}))
				}
			}
			results = append(results, dest)
		}
	}

	return map[string]interface{}{
		"rows":          results,
		"total_rows":    len(results),
		"rows_affected": rowsAffected,
		"successful":    err == nil,
	}, nil
}
