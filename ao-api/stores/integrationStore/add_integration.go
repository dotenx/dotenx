package integrationStore

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

var storeIntegration = `
INSERT INTO integrations (account_id, type, name, secrets, hasRefreshToken, provider, tp_account_id, project_name)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
`

func (store *integrationStore) AddIntegration(ctx context.Context, accountId string, integration models.Integration) error {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = storeIntegration
	default:
		return fmt.Errorf("driver not supported")
	}
	marshalled, _ := json.Marshal(integration.Secrets)
	res, err := store.db.Connection.Exec(stmt, accountId, integration.Type, integration.Name, marshalled, integration.HasRefreshToken, integration.Provider, integration.TpAccountId, integration.ProjectName)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("can not add integration, try again")
	}
	return nil
}
