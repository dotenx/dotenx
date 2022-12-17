package databaseStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"

	"github.com/dotenx/dotenx/ao-api/db/dbutil"
	"github.com/dotenx/dotenx/ao-api/models"
)

var getViewDetails = `
SELECT *
FROM   views
WHERE  name = $1;
`

func (ds *databaseStore) GetViewDetails(ctx context.Context, accountId string, projectName string, viewName string) (models.DatabaseView, error) {
	db, fn, err := dbutil.GetDbInstance(accountId, projectName)
	if db != nil {
		defer fn(db.Connection)
	}
	if err != nil {
		log.Println("Error getting database connection:", err)
		return models.DatabaseView{}, err
	}

	var view models.DatabaseView
	conn := db.Connection
	err = conn.QueryRowx(getViewDetails, viewName).StructScan(&view)
	if err != nil {
		log.Println("Error getting view:", err)
		if err == sql.ErrNoRows {
			err = errors.New("not found")
		}
		return models.DatabaseView{}, err
	}
	return view, nil
}

func (ds *databaseStore) GetViewDetailsByProjectTag(ctx context.Context, projectTag string, viewName string) (models.DatabaseView, error) {
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
		return models.DatabaseView{}, err
	}

	db, fn, err := dbutil.GetDbInstance(res.AccountId, res.ProjectName)
	if db != nil {
		defer fn(db.Connection)
	}
	if err != nil {
		log.Println("Error getting database connection:", err)
		return models.DatabaseView{}, err
	}

	var view models.DatabaseView
	conn := db.Connection
	err = conn.QueryRowx(getViewDetails, viewName).StructScan(&view)
	if err != nil {
		log.Println("Error getting view:", err)
		if err == sql.ErrNoRows {
			err = errors.New("not found")
		}
		return models.DatabaseView{}, err
	}
	return view, nil
}
