package integrationStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/dotenx/dotenx/ao-api/db"
)

var checkTriggers = `
SELECT count(*) FROM event_triggers
WHERE integration = $1 and account_id = $2;
`

func (ps *integrationStore) CheckTriggersForIntegration(context context.Context, accountId string, integrationName string) (bool, error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		var count int
		err := conn.QueryRow(checkTriggers, integrationName, accountId).Scan(&count)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return false, err
		}
		if count > 0 {
			return true, nil
		}
		return false, nil
	}
	return false, errors.New("driver not supported")
}
