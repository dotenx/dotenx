package databaseStore

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/lib/pq"
)

type condition struct {
	Key      string      `json:"key"`
	Operator string      `json:"operator"`
	Value    interface{} `json:"value"`
}

type ConditionGroup struct {
	FilterSet   []condition `json:"filterSet"`
	Conjunction string      `json:"conjunction,omitempty" binding:"oneof='and' 'or' ''"`
}

var getColumnType = `
SELECT data_type
FROM   information_schema.columns
WHERE  table_schema = 'public'
AND    table_name = $1
AND    column_name = $2
`

// We first convert this to a parameterized query and then execute it with the values
var selectRows = `
SELECT %s 
FROM   %s 
%s
LIMIT $1 OFFSET $2;
`

var conditionalSelectRows = `
SELECT %s 
FROM   %s 
WHERE  (%s) %s
LIMIT %s OFFSET %s;
`

func (ds *databaseStore) SelectRows(ctx context.Context, useRowLevelSecurity bool, tpAccountId, projectTag string, tableName string, columns []string, filters ConditionGroup, offset int, limit int) ([]map[string]interface{}, error) {

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

	whereCondition := ""
	signCnt := 1
	values := make([]interface{}, 0)
	if len(filters.FilterSet) != 0 {
		for i, cond := range filters.FilterSet {
			currentTableName := tableName
			columnName := cond.Key
			if strings.Contains(cond.Key, "__") && !strings.HasPrefix(cond.Key, "__") {
				currentTableName = strings.Split(cond.Key, "__")[0]
				columnName = strings.Split(cond.Key, "__")[1]
				cond.Key = strings.Replace(cond.Key, "__", ".", 1)
			} else {
				cond.Key = fmt.Sprintf("%s.%s", tableName, cond.Key)
			}
			log.Println("currentTableName:", currentTableName)
			log.Println("columnName:", columnName)
			var columnType string
			err := db.Connection.QueryRowx(getColumnType, currentTableName, columnName).Scan(&columnType)
			if err != nil {
				if err == sql.ErrNoRows {
					err = errors.New("column not found")
				}
				log.Println("error:", err)
				return nil, err
			}
			log.Println("columnType:", columnType)
			if columnType == "character varying" || columnType == "text" {
				switch cond.Operator {
				case "=", "!=":
					whereCondition += fmt.Sprintf("%s %s $%d", cond.Key, cond.Operator, signCnt)
					signCnt += 1
					values = append(values, cond.Value)
				case "contains":
					whereCondition += fmt.Sprintf("%s LIKE $%d", cond.Key, signCnt)
					signCnt += 1
					values = append(values, fmt.Sprintf("%%%s%%", cond.Value))
				case "doesNotContain":
					whereCondition += fmt.Sprintf("%s NOT LIKE $%d", cond.Key, signCnt)
					signCnt += 1
					values = append(values, fmt.Sprintf("%%%s%%", cond.Value))
				default:
					err = errors.New("operator not supported in filtering")
					return nil, err
				}
			} else if columnType == "integer" {
				supportedOperator := []string{"=", "!=", ">", "<", ">=", "<="}
				if utils.ContainsString(supportedOperator, cond.Operator) {
					whereCondition += fmt.Sprintf("%s %s $%d", cond.Key, cond.Operator, signCnt)
					signCnt += 1
					values = append(values, cond.Value)
				} else {
					err = errors.New("operator not supported in filtering")
					return nil, err
				}
			} else {
				err = errors.New("column type not supported in filtering")
				return nil, err
			}
			if i < len(filters.FilterSet)-1 {
				whereCondition += fmt.Sprintf(" %s ", filters.Conjunction)
			}
		}
	}

	cl := strings.TrimSuffix(strings.Join(columns, ","), ",")

	checkSecurityStmt := ""
	var result *sql.Rows
	if len(filters.FilterSet) == 0 {
		if useRowLevelSecurity && tpAccountId != "" {
			checkSecurityStmt = fmt.Sprintf("WHERE creator_id = '%s'", tpAccountId)
		}
		stmt := fmt.Sprintf(selectRows, cl, tableNameStmt, checkSecurityStmt)
		log.Println("stmt:", stmt)
		result, err = db.Connection.Query(stmt, limit, offset)
	} else {
		if useRowLevelSecurity && tpAccountId != "" {
			// Todo: add all joined table to checkSecurityStmt
			checkSecurityStmt = fmt.Sprintf(" AND %s.creator_id = '%s'", tableName, tpAccountId)
		}
		stmt := fmt.Sprintf(conditionalSelectRows, cl, tableNameStmt, whereCondition, checkSecurityStmt, "$"+fmt.Sprint(signCnt), "$"+fmt.Sprint(signCnt+1))
		log.Println("stmt:", stmt)
		values = append(values, limit)
		values = append(values, offset)
		log.Println("values:", values)
		log.Printf("values: %#v\n", values)
		result, err = db.Connection.Query(stmt, values...)
		// log.Println("result:", result.)
	}
	if err != nil {
		return nil, err
	}

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
	rvalues := make([]interface{}, numColumns)
	// for i := range values {
	// 	values[i] = new(interface{})
	// }
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

	var results []map[string]interface{}
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

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return results, nil
}
