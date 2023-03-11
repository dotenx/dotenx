package integrationStore

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/jmoiron/sqlx"
)

var getIntegrationsByType = `
select account_id, type, name, secrets, hasRefreshToken, provider, tp_account_id, project_name from integrations 
where account_id = $1 and type = $2 and tp_account_id='';
`

var getIntegrationsByTypeAndProjectName = `
select account_id, type, name, secrets, hasRefreshToken, provider, tp_account_id, project_name from integrations 
where account_id = $1 and type = $2 and project_name = $3 and tp_account_id='';
`

func (store *integrationStore) GetIntegrationsByType(ctx context.Context, accountId, integrationType, projectName string) ([]models.Integration, error) {
	res := make([]models.Integration, 0)
	switch store.db.Driver {
	case db.Postgres:
		conn := store.db.Connection
		var rows *sqlx.Rows
		var err error
		if projectName != "" {
			rows, err = conn.Queryx(getIntegrationsByTypeAndProjectName, accountId, integrationType, projectName)
		} else {
			rows, err = conn.Queryx(getIntegrationsByType, accountId, integrationType)
		}
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return nil, err
		}
		defer rows.Close()
		for rows.Next() {
			var cur models.Integration
			var secrets []byte
			rows.Scan(&cur.AccountId, &cur.Type, &cur.Name, &secrets, &cur.HasRefreshToken, &cur.Provider, &cur.TpAccountId, &cur.ProjectName)
			if err != nil {
				return res, err
			}
			err = json.Unmarshal(secrets, &cur.Secrets)
			if err != nil {
				return res, err
			}
			res = append(res, cur)
		}
	}
	return res, nil
}
