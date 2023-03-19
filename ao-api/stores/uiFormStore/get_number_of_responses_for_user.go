package uiFormStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/sirupsen/logrus"
)

func (store *uiFormStore) GetNumberOfResponsesForUser(ctx context.Context, accountId, projectType, from, to string) (int64, error) {
	numberOfSubmission := `
	SELECT count(*) 
	FROM ui_forms JOIN projects ON ui_forms.project_tag = projects.tag 
	WHERE `

	args := []interface{}{}
	i := 1
	if from != "" {
		numberOfSubmission += fmt.Sprintf("submitted_at >= $%d AND ", i)
		i++
		args = append(args, from)
	}
	if to != "" {
		numberOfSubmission += fmt.Sprintf("submitted_at < $%d AND ", i)
		i++
		args = append(args, to)
	}

	numberOfSubmission += fmt.Sprintf("projects.account_id = $%d AND ", i)
	i++
	args = append(args, accountId)
	numberOfSubmission += fmt.Sprintf("projects.type = $%d;", i)
	i++
	args = append(args, projectType)

	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = numberOfSubmission
	default:
		return -1, fmt.Errorf("driver not supported")
	}

	var num int64
	err := store.db.Connection.QueryRow(stmt, args...).Scan(&num)
	if err != nil {
		logrus.Error(err.Error())
		return -1, err
	}
	return num, nil
}
