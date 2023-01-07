package gitIntegrationStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (store *gitIntegrationStore) ListIntegrations(ctx context.Context, accountId, provider string) ([]models.GitIntegration, error) {
	listIntegrations := `
	SELECT git_account_id, git_username FROM git_integration WHERE account_id = $1 AND provider = $2;
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = listIntegrations
	default:
		return nil, fmt.Errorf("driver not supported")
	}
	var integrations []models.GitIntegration
	err := store.db.Connection.Select(&integrations, stmt, accountId, provider)
	if err != nil {
		logrus.Error(err.Error())
		return nil, err
	}
	return integrations, nil
}
