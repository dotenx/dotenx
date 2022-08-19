package uibuilderStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (store *uibuilderStore) UpsertUiInfrastructure(ctx context.Context, uiInfra models.UiInfrastructure) error {
	upsertPage := `
	INSERT INTO project_ui_infrastructure (account_id, project_tag, cdn_arn, cdn_domain, s3_bucket)
	VALUES ($1, $2, $3, $4, $5) ON CONFLICT (account_id, project_tag) DO UPDATE SET cdn_arn = EXCLUDED.cdn_arn, cdn_domain = EXCLUDED.cdn_domain, s3_bucket = EXCLUDED.s3_bucket
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = upsertPage
	default:
		return fmt.Errorf("driver not supported")
	}
	_, err := store.db.Connection.Exec(stmt, uiInfra.AccountId, uiInfra.ProjectTag, uiInfra.CdnArn, uiInfra.CdnDomain, uiInfra.S3Bucket)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	return nil
}
