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

var findProjectDatabase = `
SELECT account_id, name FROM projects
WHERE tag = $1
`

// We first convert this to a parameterized query and then execute it with the values
var insertRow = `
INSERT INTO %s (%s) VALUES (%s)
`

func (ds *databaseStore) InsertRow(ctx context.Context, projectTag string, tableName string, row map[string]string) error {
	fmt.Println("here")

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
		return err
	}
	fmt.Println("res:", res)

	db, fn, err := dbutil.GetDbInstance(res.AccountId, res.ProjectName)

	defer fn(db.Connection)
	if err != nil {
		log.Println("Error getting database connection:", err)
		return err
	}

	var cb strings.Builder
	var pb strings.Builder
	count := 1
	values := make([]interface{}, 0, len(row))

	for key, value := range row {
		cb.WriteString(key + ",")
		pb.WriteString("$" + strconv.Itoa(count) + ",")
		count++
		values = append(values, value)

	}
	columns := strings.TrimSuffix(cb.String(), ",")
	params := strings.TrimSuffix(pb.String(), ",")

	stmt := fmt.Sprintf(insertRow, tableName, columns, params)
	fmt.Println("stmt:", stmt)

	_, err = db.Connection.Exec(stmt, values...)
	if err != nil {
		log.Println("Error adding table column:", err)
		return err
	}
	log.Println("Table column added:", tableName)
	return nil
}
