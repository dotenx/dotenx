package integrationStore

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

var getIntegrationsByName = `
select account_id, type, name, secrets, hasRefreshToken, provider, tp_account_id, project_name from integrations 
where account_id = $1 and name = $2;
`

func (store *integrationStore) GetIntegrationByName(ctx context.Context, accountId, name string) (models.Integration, error) {
	switch store.db.Driver {
	case db.Postgres:
		conn := store.db.Connection
		rows, err := conn.Queryx(getIntegrationsByName, accountId, name)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return models.Integration{}, err
		}
		defer rows.Close()
		for rows.Next() {
			var cur models.Integration
			var secrets []byte
			rows.Scan(&cur.AccountId, &cur.Type, &cur.Name, &secrets, &cur.HasRefreshToken, &cur.Provider, &cur.TpAccountId, &cur.ProjectName)
			if err != nil {
				return models.Integration{}, err
			}
			err = json.Unmarshal(secrets, &cur.Secrets)
			if err != nil {
				return models.Integration{}, err
			}
			if err != nil {
				return models.Integration{}, err
			} else {
				return cur, nil
			}
		}
	}
	return models.Integration{}, nil
}
