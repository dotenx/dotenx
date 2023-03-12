package integrationStore

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

var updateIntegration = `
update integrations 
set secrets = $1
where account_id = $2 and name = $3;
`

func (store *integrationStore) UpdateIntegration(ctx context.Context, accountId, integrationName string, integration models.Integration) error {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = updateIntegration
	default:
		return fmt.Errorf("driver not supported")
	}
	marshalled, _ := json.Marshal(integration.Secrets)
	res, err := store.db.Connection.Exec(stmt, marshalled, accountId, integrationName)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return utils.ErrIntegrationNotFound
	}
	return nil
}
