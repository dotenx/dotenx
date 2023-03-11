package integrationStore

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/db"
)

var deleteIntegration = `
delete from integrations 
where account_id = $1 and name = $2;
`

func (store *integrationStore) DeleteIntegration(ctx context.Context, accountId string, integrationName string) error {
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = deleteIntegration
	default:
		return fmt.Errorf("driver not supported")
	}
	res, err := store.db.Connection.Exec(stmt, accountId, integrationName)
	if err != nil {
		return err
	}
	if count, _ := res.RowsAffected(); count == 0 {
		return fmt.Errorf("can not delete integration")
	}
	return nil
}
