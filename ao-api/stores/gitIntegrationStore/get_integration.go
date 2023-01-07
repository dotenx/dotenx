package gitIntegrationStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (store *gitIntegrationStore) GetIntegration(ctx context.Context, accountId, gitAccountId, provider string) (models.GitIntegration, error) {
	getIntegration := `
	SELECT * FROM git_integration WHERE account_id = $1 AND git_account_id = $2 AND provider = $3;
	`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = getIntegration
	default:
		return models.GitIntegration{}, fmt.Errorf("driver not supported")
	}

	var integration models.GitIntegration
	err := store.db.Connection.QueryRowx(stmt, accountId, gitAccountId, provider).StructScan(&integration)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("integration not found")
		}
	}
	return integration, err
}
