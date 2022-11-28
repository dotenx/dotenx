package databaseStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/dotenx/dotenx/ao-api/models"
)

var getViewsList = `
SELECT name, is_public
FROM   views;
`

func (ds *databaseStore) GetViewsList(ctx context.Context, accountId string, projectName string) ([]models.DatabaseView, error) {
	db, fn, err := dbutil.GetDbInstance(accountId, projectName)
	if db != nil {
		defer fn(db.Connection)
	}
	if err != nil {
		log.Println("Error getting database connection:", err)
		return nil, err
	}

	viewsList := make([]models.DatabaseView, 0)
	conn := db.Connection
	rows, err := conn.Queryx(getViewsList)
	if err != nil {
		log.Println(err.Error())
		if err == sql.ErrNoRows {
			err = errors.New("not found")
		}
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var cur models.DatabaseView
		rows.Scan(&cur.Name, &cur.IsPublic)
		if err != nil {
			return viewsList, err
		}
		viewsList = append(viewsList, cur)
	}
	return viewsList, nil
}
