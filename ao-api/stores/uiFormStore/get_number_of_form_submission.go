package uiFormStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/sirupsen/logrus"
)

func (store *uiFormStore) GetNumberOfFormSubmission(ctx context.Context, projectTag, pageName string) (int64, error) {
	numberOfSubmission := `
	SELECT count(*) FROM ui_forms WHERE project_tag = $1 AND page_name = $2;
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = numberOfSubmission
	default:
		return -1, fmt.Errorf("driver not supported")
	}
	var num int64
	err := store.db.Connection.QueryRow(stmt, projectTag, pageName).Scan(&num)
	if err != nil {
		logrus.Error(err.Error())
		return -1, err
	}
	return num, nil
}
