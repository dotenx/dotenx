package databaseStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
)

// We first convert this to a parameterized query and then execute it with the values
var updateRow = `
UPDATE %s
SET    %s
WHERE  id = %s %s;
`

func (ds *databaseStore) UpdateRow(ctx context.Context, useRowLevelSecurity bool, tpAccountId, projectTag string, tableName string, id int, row map[string]interface{}) error {

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
		log.Println("error:", err)
		return err
	}
	log.Println("res:", res)

	db, fn, err := dbutil.GetDbInstance(res.AccountId, res.ProjectName)
	defer fn(db.Connection)
	if err != nil {
		log.Println("Error getting database connection:", err)
		return err
	}

	var cb strings.Builder
	count := 1
	values := make([]interface{}, 0, len(row))
	for key, value := range row {
		cb.WriteString(key + " = $" + strconv.Itoa(count) + ",")
		count++
		values = append(values, value)
	}
	columns := strings.TrimSuffix(cb.String(), ",")
	checkSecurityStmt := ""
	if useRowLevelSecurity && tpAccountId != "" {
		checkSecurityStmt = fmt.Sprintf(" AND creator_id = '%s'", tpAccountId)
	}
	stmt := fmt.Sprintf(updateRow, tableName, columns, "$"+strconv.Itoa(count), checkSecurityStmt)
	log.Println("stmt:", stmt)

	values = append(values, id)
	log.Println("values:", values)
	result, err := db.Connection.Exec(stmt, values...)
	if err != nil {
		log.Println("Error updating table row:", err)
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil || rowsAffected == 0 {
		err = errors.New("you haven't access to update this row")
		return err
	}
	log.Println("Table row updated:", tableName)
	return nil
}
