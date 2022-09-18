package marketplaceStore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (store *marketplaceStore) GetFunction(ctx context.Context, name string) (models.Function, error) {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = getFunctionStmt
	default:
		return models.Function{}, fmt.Errorf("driver not supported")
	}
	var function models.Function

	err := store.db.Connection.QueryRowx(stmt, name).StructScan(&function)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("function not found")
		}
	}
	return function, err
}

var getFunctionStmt = `
SELECT * FROM function WHERE name = $1
`
