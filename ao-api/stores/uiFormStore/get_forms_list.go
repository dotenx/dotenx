package uiFormStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (store *uiFormStore) GetFormsList(ctx context.Context, projectTag, pageName string) ([]models.UIForm, error) {
	listForms := `
	SELECT DISTINCT form_id, name FROM ui_forms WHERE project_tag = $1 AND page_name = $2;
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = listForms
	default:
		return nil, fmt.Errorf("driver not supported")
	}
	var forms []models.UIForm
	err := store.db.Connection.Select(&forms, stmt, projectTag, pageName)
	if err != nil {
		logrus.Error(err.Error())
		return nil, err
	}
	return forms, nil
}
