package databaseStore

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
	pg_query "github.com/pganalyze/pg_query_go/v2"
	"github.com/sirupsen/logrus"
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
	_, err = db.Connection.Exec(fmt.Sprintf("SET statement_timeout = %s;", config.Configs.App.CustomQueryTimeLimit))
	if err != nil {
		return nil, err
	}

	// we use this parser to parse query: https://github.com/pganalyze/pg_query_go
	parseResultStr, err := pg_query.ParseToJSON(query)
	if err != nil {
		return nil, err
	}
	var parseResultMap interface{}
	err = json.Unmarshal([]byte(parseResultStr), &parseResultMap)
	if err != nil {
		return nil, err
	}
	logrus.Info(parseResultStr)
	if len(parseResultMap.(map[string]interface{})["stmts"].([]interface{})) != 1 {
		return nil, errors.New("you can run just one query at each time")
	}
	parseResultMap = parseResultMap.(map[string]interface{})["stmts"].([]interface{})[0].(map[string]interface{})
	parsedStmt := parseResultMap.(map[string]interface{})["stmt"]
	queryReturnRows := false
	i := 0
	for stmtType, _ := range parsedStmt.(map[string]interface{}) {
		if stmtType != "SelectStmt" && stmtType != "DeleteStmt" && stmtType != "UpdateStmt" && stmtType != "InsertStmt" {
			return nil, errors.New("you can run just these type of queries: ['insert', 'select', 'update', 'delete']")
		}
		if i == 0 && stmtType == "SelectStmt" {
			queryReturnRows = true
		}
		i++
	}

	var rows *sqlx.Rows
	var rowsAffected int64
	if !queryReturnRows {
		// Execute the query
		result, err := db.Connection.Exec(query)
		if err != nil {
			return nil, err
		}
		// Determine the number of affected rows
		rowsAffected, err = result.RowsAffected()
		if err != nil {
			return nil, err
		}
	} else {
		rows, err = db.Connection.Queryx(query)
		if err != nil {
			return nil, err
		}
		defer rows.Close()
	}

	var results []map[string]interface{}
	// If the query is a SELECT statement, fetch the rows
	if queryReturnRows {
		rowsAffected = 0
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
