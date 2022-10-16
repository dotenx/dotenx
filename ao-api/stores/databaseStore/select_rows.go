package databaseStore

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strings"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/lib/pq"
	"github.com/sirupsen/logrus"
)

// type condition struct {
// 	Key         string      `json:"key"`
// 	Operator    string      `json:"operator"`
// 	Value       interface{} `json:"value"`
// 	FilterSet   []condition `json:"filterSet"`
// 	Conjunction string      `json:"conjunction,omitempty" binding:"oneof='and' 'or' ''"`
// }

type ConditionGroup struct {
	Key      string      `json:"key"`
	Operator string      `json:"operator"`
	Value    interface{} `json:"value"`
	// ConditionGroup is a field that has one of this fields inside itself: [key, operator, value] nor [filterSet, conjunction]
	FilterSet   []ConditionGroup `json:"filterSet"`
	Conjunction string           `json:"conjunction,omitempty" binding:"oneof='and' 'or' ''"`
}

type Function struct {
	Function string   `json:"function"`
	Columns  []string `json:"columns"`
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

var getFunctionResultStmt = `
SELECT %s 
FROM   %s 
%s
`

var getConditionalFunctionResultStmt = `
SELECT %s 
FROM   %s 
WHERE  (%s) %s
`

func (ds *databaseStore) SelectRows(ctx context.Context, useRowLevelSecurity bool, tpAccountId, projectTag string, tableName string, columns []string, functions []Function, filters ConditionGroup, offset int, limit int) (map[string]interface{}, error) {

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

	allSelectItems := map[string]int{}
	joinedTables := make([]string, 0)
	tableNameStmt := tableName
	for i, _ := range columns {
		allSelectItems[columns[i]] = 1
	}
	for _, f := range functions {
		for _, c := range f.Columns {
			allSelectItems[c] = 1
		}
	}
	for _, fs := range filters.FilterSet {
		allSelectItems[fs.Key] = 1
	}
	for item, _ := range allSelectItems {
		if strings.HasPrefix(item, "__") {
			continue
		}
		if strings.Contains(item, "__") {
			if len(strings.Split(item, "__")) != 2 {
				return nil, errors.New("invalid column name")
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

	for i, _ := range columns {
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
		returnValues, conditionStmt, err := getConditionStmt(filters, db, &signCnt, tableName)
		if err != nil {
			log.Println("Error getting condition statement:", err)
			return nil, err
		}
		whereCondition = conditionStmt
		logrus.Info("final where condition stmt:", whereCondition)
		values = append(values, returnValues...)
	}

	// resultFunctionNames := make([]string, 0)
	functionSelectItems := make([]string, 0)
	if len(functions) != 0 {
		for _, function := range functions {
			for _, column := range function.Columns {
				currentTableName := tableName
				columnName := column
				columnFullName := ""
				if strings.Contains(column, "__") && !strings.HasPrefix(column, "__") {
					currentTableName = strings.Split(column, "__")[0]
					columnName = strings.Split(column, "__")[1]
					columnFullName = strings.Replace(column, "__", ".", 1)
				} else {
					columnFullName = fmt.Sprintf("%s.%s", tableName, column)
				}
				var columnType string
				err := db.Connection.QueryRowx(getColumnType, currentTableName, columnName).Scan(&columnType)
				if err != nil {
					if err == sql.ErrNoRows {
						err = errors.New("column not found")
					}
					logrus.Info("error:", err)
					return nil, err
				}
				if columnType == "integer" || columnType == "double precision" {
					switch strings.ToLower(function.Function) {
					case "avg", "sum", "min", "max", "count":
						functionSelectItems = append(functionSelectItems, fmt.Sprintf("%s(%s) AS %s_%s", strings.ToLower(function.Function), columnFullName, strings.ToLower(function.Function), column))
						// resultFunctionNames = append(resultFunctionNames, function.Function)
					default:
						err := errors.New("function not supported")
						return nil, err
					}
				} else {
					switch strings.ToLower(function.Function) {
					case "count":
						functionSelectItems = append(functionSelectItems, fmt.Sprintf("%s(%s) AS %s_%s", strings.ToLower(function.Function), columnFullName, strings.ToLower(function.Function), column))
					default:
						err := errors.New("function not supported for this column")
						return nil, err
					}
				}
			}
		}
	}

	cl := strings.TrimSuffix(strings.Join(columns, ","), ",")
	fcl := strings.TrimSuffix(strings.Join(functionSelectItems, ","), ",")

	checkSecurityStmt := ""
	var result, functionResults *sql.Rows
	if len(filters.FilterSet) == 0 {
		if cl != "" {
			if useRowLevelSecurity && tpAccountId != "" {
				checkSecurityStmt = fmt.Sprintf("WHERE creator_id = '%s'", tpAccountId)
			}
			stmt := fmt.Sprintf(selectRows, cl, tableNameStmt, checkSecurityStmt)
			log.Println("stmt:", stmt)
			result, err = db.Connection.Query(stmt, limit, offset)
			if err != nil {
				return nil, err
			}
		} else {
			result = nil
		}

		if len(functions) != 0 {
			functionStmt := fmt.Sprintf(getFunctionResultStmt, fcl, tableNameStmt, checkSecurityStmt)
			log.Println("functionStmt:", functionStmt)
			functionResults, err = db.Connection.Query(functionStmt)
		} else {
			functionResults = nil
		}
	} else {
		functionValues := values
		if cl != "" {
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
			if err != nil {
				return nil, err
			}
			// log.Println("result:", result.)
		} else {
			result = nil
		}

		if len(functions) != 0 {
			functionStmt := fmt.Sprintf(getConditionalFunctionResultStmt, fcl, tableNameStmt, whereCondition, checkSecurityStmt)
			log.Println("functionStmt:", functionStmt)
			functionResults, err = db.Connection.Query(functionStmt, functionValues...)
		} else {
			functionResults = nil
		}
	}
	if err != nil {
		return nil, err
	}

	return SelectScan(result, functionResults)
}

func SelectScan(rows, functionResults *sql.Rows) (map[string]interface{}, error) {
	var results []map[string]interface{}
	if rows != nil {
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
	}

	funcDest := make(map[string]interface{})
	if functionResults != nil {
		defer functionResults.Close()
		funcColumns, err := functionResults.Columns()
		if err != nil {
			return nil, err
		}
		funcNumColumns := len(funcColumns)
		funcValues := make([]interface{}, funcNumColumns)
		for i, column := range funcColumns {
			funcName := strings.SplitN(column, "_", 2)[0]
			if funcName == "avg" {
				funcValues[i] = new(float64)
			} else {
				funcValues[i] = new(interface{})
			}
		}
		functionResults.Next()
		if err := functionResults.Scan(funcValues...); err != nil {
			return nil, err
		}
		for i, column := range funcColumns {
			funcName := strings.SplitN(column, "_", 2)[0]
			columnName := strings.SplitN(column, "_", 2)[1]
			if funcDest[funcName] == nil {
				funcDest[funcName] = make(map[string]interface{})
			}
			if _, ok := funcValues[i].(*float64); ok {
				funcDest[funcName].(map[string]interface{})[columnName] = *(funcValues[i].(*float64))
			} else {
				funcDest[funcName].(map[string]interface{})[columnName] = *(funcValues[i].(*interface{}))
			}
		}
		if err := functionResults.Err(); err != nil {
			return nil, err
		}
	}

	finalResults := map[string]interface{}{
		"rows":      results,
		"functions": funcDest,
	}

	return finalResults, nil
}

func getConditionStmt(conditionGroup ConditionGroup, db *db.DB, signCnt *int, tableName string) (returnValues []interface{}, conditionStmt string, err error) {
	// whereCondition := prevCondition
	// cl := strings.TrimSuffix(strings.Join(columns, ","), ",")

	if len(conditionGroup.FilterSet) != 0 {
		whereConditions := make([]string, 0)
		allValues := make([]interface{}, 0)
		for _, cond := range conditionGroup.FilterSet {
			values, stmt, err := getConditionStmt(cond, db, signCnt, tableName)
			if err != nil {
				return []interface{}{}, "", err
			}
			whereConditions = append(whereConditions, stmt)
			allValues = append(allValues, values...)
			// if i < len(filters.FilterSet)-1 {
			// 	whereCondition += fmt.Sprintf(" %s ", filters.Conjunction)
			// }
		}
		conditionStmt = strings.TrimSuffix(strings.Join(whereConditions, " "+conditionGroup.Conjunction+" "), " "+conditionGroup.Conjunction+" ")
		conditionStmt = fmt.Sprintf("(%s)", conditionStmt)
		return allValues, conditionStmt, nil
	} else {
		whereCondition := ""
		currentTableName := tableName
		cond := conditionGroup
		columnName := cond.Key
		values := make([]interface{}, 0)
		if strings.Contains(cond.Key, "__") && !strings.HasPrefix(cond.Key, "__") {
			currentTableName = strings.Split(cond.Key, "__")[0]
			columnName = strings.Split(cond.Key, "__")[1]
			cond.Key = strings.Replace(cond.Key, "__", ".", 1)
		} else {
			cond.Key = fmt.Sprintf("%s.%s", tableName, cond.Key)
		}
		var columnType string
		err := db.Connection.QueryRowx(getColumnType, currentTableName, columnName).Scan(&columnType)
		if err != nil {
			if err == sql.ErrNoRows {
				err = errors.New("column not found")
			}
			log.Println("error:", err)
			return []interface{}{}, "", err
		}
		if columnType == "character varying" || columnType == "text" {
			switch cond.Operator {
			case "=", "!=":
				whereCondition += fmt.Sprintf("%s %s $%d", cond.Key, cond.Operator, *signCnt)
				*signCnt += 1
				values = append(values, cond.Value)
			case "contains":
				whereCondition += fmt.Sprintf("%s LIKE $%d", cond.Key, *signCnt)
				*signCnt += 1
				values = append(values, fmt.Sprintf("%%%s%%", cond.Value))
			case "doesNotContain":
				whereCondition += fmt.Sprintf("%s NOT LIKE $%d", cond.Key, *signCnt)
				*signCnt += 1
				values = append(values, fmt.Sprintf("%%%s%%", cond.Value))
			default:
				err = errors.New("operator not supported in filtering")
				return []interface{}{}, "", err
			}
		} else if columnType == "integer" || columnType == "double precision" {
			supportedOperator := []string{"=", "!=", ">", "<", ">=", "<="}
			if utils.ContainsString(supportedOperator, cond.Operator) {
				whereCondition += fmt.Sprintf("%s %s $%d", cond.Key, cond.Operator, *signCnt)
				*signCnt += 1
				values = append(values, cond.Value)
			} else {
				err = errors.New("operator not supported in filtering")
				return []interface{}{}, "", err
			}
		} else if columnType == "boolean" {
			supportedOperator := []string{"=", "!="}
			if utils.ContainsString(supportedOperator, cond.Operator) {
				whereCondition += fmt.Sprintf("%s %s $%d", cond.Key, cond.Operator, *signCnt)
				*signCnt += 1
				values = append(values, cond.Value)
			} else {
				err = errors.New("operator not supported in filtering")
				return []interface{}{}, "", err
			}
		} else if columnType == "ARRAY" {
			switch cond.Operator {
			case "=", "!=":
				whereCondition += fmt.Sprintf("%s %s $%d", cond.Key, cond.Operator, *signCnt)
				*signCnt += 1
				values = append(values, pq.Array(cond.Value))
			case "has":
				whereCondition += fmt.Sprintf("$%d = ANY (%s)", *signCnt, cond.Key)
				*signCnt += 1
				values = append(values, cond.Value)
			case "hasNot":
				whereCondition += fmt.Sprintf("NOT ($%d = ANY (%s))", *signCnt, cond.Key)
				*signCnt += 1
				values = append(values, cond.Value)
			default:
				err = errors.New("operator not supported in filtering")
				return []interface{}{}, "", err
			}
		} else {
			err = errors.New("column type not supported in filtering")
			return []interface{}{}, "", err
		}
		return values, whereCondition, nil
	}
}
