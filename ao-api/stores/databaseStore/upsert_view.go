package databaseStore

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

var viewSelectQuery = `
SELECT %s 
FROM   %s
`

var viewConditionalSelectQuery = `
SELECT %s 
FROM   %s 
WHERE  %s
`

var addViewToTableStmt = `
INSERT INTO views (name, query, query_as_json, values, is_public)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT(name) DO UPDATE SET
	query = $2,
	query_as_json = $3,
	values = $4,
	is_public = $5;
`

func (ds *databaseStore) UpsertView(ctx context.Context, accountId string, projectName string, viewName string, tableName string, columns []string, filters ConditionGroup, jsonQuery map[string]interface{}, isPublic bool) error {

	db, fn, err := dbutil.GetDbInstance(accountId, projectName)
	if db != nil {
		defer fn(db.Connection)
	}
	if err != nil {
		log.Println("Error getting database connection:", err)
		return err
	}

	allSelectItems := map[string]int{}
	joinedTables := make([]string, 0)
	tableNameStmt := tableName
	for i := range columns {
		allSelectItems[columns[i]] = 1
	}
	applyConditionGroupKeys(filters, allSelectItems)
	for item := range allSelectItems {
		if strings.HasPrefix(item, "__") {
			continue
		}
		if strings.Contains(item, "__") {
			if len(strings.Split(item, "__")) != 2 {
				return errors.New("invalid column name")
			}
			joinTable := strings.Split(item, "__")[0]
			// we should check that join each table just once so we need joinedTables slice
			if !utils.ContainsString(joinedTables, joinTable) {
				joinedTables = append(joinedTables, joinTable)
				tableNameStmt += " JOIN " + joinTable
				tableNameStmt += " ON " + tableName + ".__" + joinTable + " = " + fmt.Sprintf("%s.id", joinTable)
				tableNameStmt += "\n"
			}
		}
	}

	for i := range columns {
		if !strings.HasPrefix(columns[i], "__") && strings.Contains(columns[i], "__") {
			// convert TABLE__FIELD to TABLE.FIELD for sql query statement
			columns[i] = strings.Replace(columns[i], "__", ".", 1) + " AS " + columns[i]
		} else {
			columns[i] = fmt.Sprintf("%s.%s", tableName, columns[i])
		}
	}

	whereCondition := ""
	signCnt := 1
	values := make([]interface{}, 0)
	if len(filters.FilterSet) != 0 {
		returnValues, conditionStmt, err := getConditionStmt(filters, db, &signCnt, tableName, false)
		if err != nil {
			log.Println("Error getting condition statement:", err)
			return err
		}
		whereCondition = conditionStmt
		logrus.Info("final where condition stmt:", whereCondition)
		values = append(values, returnValues...)
	}

	cl := strings.TrimSuffix(strings.Join(columns, ","), ",")
	// var result *sql.Rows
	if len(filters.FilterSet) == 0 {
		if cl != "" {
			query := fmt.Sprintf(viewSelectQuery, cl, tableNameStmt)
			var valuesJson models.ViewJsonObject = map[string]interface{}{
				"values": make([]interface{}, 0),
			}
			var tempJsonQuery models.ViewJsonObject = jsonQuery
			_, err = db.Connection.Exec(addViewToTableStmt, viewName, query, tempJsonQuery, valuesJson, isPublic)
			if err != nil {
				return err
			}
		}
	} else {
		if cl != "" {
			query := fmt.Sprintf(viewConditionalSelectQuery, cl, tableNameStmt, whereCondition)
			log.Println("query:", query)
			log.Println("values:", values)
			log.Printf("values: %#v\n", values)
			var valuesJson models.ViewJsonObject = map[string]interface{}{
				"values": values,
			}
			var tempJsonQuery models.ViewJsonObject = jsonQuery
			_, err = db.Connection.Exec(addViewToTableStmt, viewName, query, tempJsonQuery, valuesJson, isPublic)
			if err != nil {
				return err
			}
		}
	}

	return nil
}
