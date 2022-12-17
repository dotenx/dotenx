package marketplaceStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (store *marketplaceStore) CreateFunction(ctx context.Context, function models.Function) error {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = createFunctionStmt
	default:
		return fmt.Errorf("driver not supported")
	}

	_, err := store.db.Connection.Exec(stmt, function.Name, function.AccountId, function.Enabled, function.DefinitionFile, function.Type)
	if err != nil {
		return err
	}
	return nil
}

const createFunctionStmt = `
INSERT INTO function (name, account_id, enabled, definition_file, type)
VALUES ($1, $2, $3, $4, $5)
`
