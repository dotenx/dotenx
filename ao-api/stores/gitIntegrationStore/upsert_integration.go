package gitIntegrationStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (store *gitIntegrationStore) UpsertIntegration(ctx context.Context, integration models.GitIntegration) error {
	upsertIntegration := `
	INSERT INTO git_integration (account_id, git_account_id, git_username, provider, secrets, has_refresh_token)
	VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (account_id, git_account_id, provider) 
		DO UPDATE SET secrets = EXCLUDED.secrets;
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = upsertIntegration
	default:
		return fmt.Errorf("driver not supported")
	}

	_, err := store.db.Connection.Exec(stmt, integration.AccountId, integration.GitAccountId, integration.GitUsername, integration.Provider, integration.Secrets, integration.HasRefreshToken)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	return nil
}
