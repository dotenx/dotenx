package uiFormStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (store *uiFormStore) AddNewResponse(ctx context.Context, form models.UIForm) error {
	addResponse := `
	INSERT INTO ui_forms (project_tag, page_name, form_id, response, name)
	VALUES ($1, $2, $3, $4, $5);
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = addResponse
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err := store.db.Connection.Exec(stmt, form.ProjectTag, form.PageName, form.FormId, form.Response, form.Name)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	return nil
}
