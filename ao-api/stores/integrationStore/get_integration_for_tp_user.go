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

var getIntegrationForThirdPartyUser = `
select account_id, type, name, secrets, hasRefreshToken, provider, tp_account_id from integrations 
where account_id = $1 and tp_account_id = $2 and type = $3
LIMIT 1;
`

func (store *integrationStore) GetIntegrationForThirdPartyUser(ctx context.Context, accountId, tpAccountId, integrationType string) (models.Integration, error) {
	switch store.db.Driver {
	case db.Postgres:
		conn := store.db.Connection
		rows, err := conn.Queryx(getIntegrationForThirdPartyUser, accountId, tpAccountId, integrationType)
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
			rows.Scan(&cur.AccountId, &cur.Type, &cur.Name, &secrets, &cur.HasRefreshToken, &cur.Provider, &cur.TpAccountId)
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
