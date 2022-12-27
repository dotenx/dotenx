package uibuilderStore

import (
	"context"
	"fmt"
	"time"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/sirupsen/logrus"
)

func (store *uibuilderStore) SetPageStatus(ctx context.Context, accountId, projectTag, pageName, status string, published, previewed bool) error {
	upsertPage := `
	UPDATE ui_pages SET status = $1 WHERE account_id = $2 AND project_tag = $3 AND name = $4
	`
	updatePublishedTime := `
	UPDATE ui_pages SET last_published_at = $1 WHERE account_id = $2 AND project_tag = $3 AND name = $4
	`
	updatePreviewedTime := `
	UPDATE ui_pages SET last_preview_published_at = $1 WHERE account_id = $2 AND project_tag = $3 AND name = $4
	`
	var stmt, updatePubTime, updatePreTime string
	switch store.db.Driver {
	case db.Postgres:
		stmt = upsertPage
		updatePubTime = updatePublishedTime
		updatePreTime = updatePreviewedTime
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err := store.db.Connection.Exec(stmt, status, accountId, projectTag, pageName)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	if published {
		_, err := store.db.Connection.Exec(updatePubTime, time.Now(), accountId, projectTag, pageName)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
	}
	if previewed {
		_, err := store.db.Connection.Exec(updatePreTime, time.Now(), accountId, projectTag, pageName)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
	}
	return nil
}
