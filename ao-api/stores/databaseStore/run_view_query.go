package databaseStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/lib/pq"
)

var getView = `
SELECT name, query, values, query_as_json
FROM   views
WHERE  name = $1;
`

var finalViewQuery = `
%s
%s
LIMIT %s OFFSET %s;
`

var countFinalViewQueryRows = `
SELECT COUNT(*) 
FROM   (%s %s) as my_counter;
`

func (ds *databaseStore) RunViewQuery(ctx context.Context, useRowLevelSecurity bool, tpAccountId, projectTag string, viewName string, offset int, limit int) (map[string]interface{}, error) {
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

	var view models.DatabaseView
	conn := db.Connection
	err = conn.QueryRowx(getView, viewName).Scan(&view.Name, &view.Query, &view.Values, &view.JsonQuery)
	if err != nil {
		log.Println("Error getting view:", err)
		return nil, err
	}
	log.Println("view.Query:", view.Query)
	log.Println("view.Values:", view.Values)
	for i := range view.Values["values"].([]interface{}) {
		if _, ok := view.Values["values"].([]interface{})[i].([]interface{}); ok {
			view.Values["values"].([]interface{})[i] = pq.Array(view.Values["values"].([]interface{})[i])
		}
	}

	checkSecurityStmt := ""
	tableName, ok := view.JsonQuery["tableName"].(string)
	if !ok {
		return nil, errors.New("invalid json query saved on 'views' table")
	}
	if useRowLevelSecurity && tpAccountId != "" {
		if strings.Contains(strings.ToLower(view.Query), "where") {
			checkSecurityStmt = fmt.Sprintf("  AND %s.creator_id = '%s'", tableName, tpAccountId)
		} else {
			checkSecurityStmt = fmt.Sprintf("WHERE %s.creator_id = '%s'", tableName, tpAccountId)
		}
	}

	var totalRows = 0
	countStmt := fmt.Sprintf(countFinalViewQueryRows, view.Query, checkSecurityStmt)
	err = db.Connection.QueryRow(countStmt, view.Values["values"].([]interface{})...).Scan(&totalRows)
	if err != nil {
		return nil, err
	}
	finalStmt := fmt.Sprintf(finalViewQuery, view.Query, checkSecurityStmt, fmt.Sprintf("$%d", len(view.Values["values"].([]interface{}))+1), fmt.Sprintf("$%d", len(view.Values["values"].([]interface{}))+2))
	view.Values["values"] = append(view.Values["values"].([]interface{}), limit)
	view.Values["values"] = append(view.Values["values"].([]interface{}), offset)
	log.Println("finalStmt:", finalStmt)
	log.Println("final values:", view.Values["values"])

	result, err := db.Connection.Query(finalStmt, view.Values["values"].([]interface{})...)
	if err != nil {
		return nil, err
	}
	return SelectScan(result, nil, (offset/limit)+1, limit, totalRows)
}
