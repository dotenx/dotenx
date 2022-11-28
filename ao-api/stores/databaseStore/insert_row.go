package databaseStore

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/lib/pq"
)

type jsonInterface map[string]interface{}

func (j jsonInterface) Value() (driver.Value, error) {
	return json.Marshal(j)
}

func (j *jsonInterface) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion .([]byte) failed")
	}

	var i interface{}
	err := json.Unmarshal(b, &i)
	if err != nil {
		return err
	}

	*j, ok = i.(map[string]interface{})
	if !ok {
		return errors.New("type assertion .(map[string]interface{}) failed")
	}

	return nil
}

var findProjectDatabase = `
SELECT account_id, name FROM projects
WHERE tag = $1
`

// We first convert this to a parameterized query and then execute it with the values
var insertRow = `
INSERT INTO %s (%s) VALUES (%s)
`

// var insertCreatorId = `
// INSERT INTO %s (creator_id) VALUES ($1)
// `

func (ds *databaseStore) InsertRow(ctx context.Context, projectTag string, tableName string, row map[string]interface{}) error {
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

	if db != nil {
		defer fn(db.Connection)
	}
	if err != nil {
		log.Println("Error getting database connection:", err)
		return err
	}

	// _, err = db.Connection.Exec(fmt.Sprintf(insertCreatorId, tableName), row["creator_id"])
	// if err != nil {
	// 	log.Println("Error inserting to creator_id column:", err)
	// 	return err
	// }

	var cb strings.Builder
	var pb strings.Builder
	count := 1
	values := make([]interface{}, 0, len(row))

	for key, value := range row {
		cb.WriteString(key + ",")
		pb.WriteString("$" + strconv.Itoa(count) + ",")
		count++
		if _, ok := value.(map[string]interface{}); ok {
			jsBytes, err := json.Marshal(value)
			if err != nil {
				return err
			}
			var js jsonInterface
			err = json.Unmarshal(jsBytes, &js)
			if err != nil {
				return err
			}
			values = append(values, js)
		} else if _, ok := value.([]interface{}); ok {
			values = append(values, pq.Array(value))
		} else {
			values = append(values, value)
		}

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
