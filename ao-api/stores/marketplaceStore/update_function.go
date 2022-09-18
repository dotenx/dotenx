package marketplaceStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (store *marketplaceStore) UpdateFunction(ctx context.Context, function models.Function) error {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = updateFunctionStmt
	default:
		return fmt.Errorf("driver not supported")
	}

	_, err := store.db.Connection.Exec(stmt, function.Enabled, function.DefinitionFile, function.Type, function.Name)
	if err != nil {
		return err
	}
	return nil
}

const updateFunctionStmt = `
UPDATE function
SET    enabled = $1, definition_file = $2, type = $3
WHERE  name = $4
`
