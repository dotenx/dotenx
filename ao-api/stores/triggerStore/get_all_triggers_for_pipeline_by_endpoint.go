package triggerStore

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

func (store *triggerStore) GetAllTriggersForPipelineByEndpoint(ctx context.Context, endpoint string) ([]models.EventTrigger, error) {

	getTriggers := `select type, name, account_id, integration, endpoint, credentials from event_triggers where endpoint = $1`
	var stmt string
	switch store.db.Driver {
	case db.Postgres:
		stmt = getTriggers
	default:
		return nil, fmt.Errorf("driver not supported")
	}
	rows, err := store.db.Connection.Query(stmt, endpoint)
	if err != nil {
		log.Println(err.Error())
		if err == sql.ErrNoRows {
			err = errors.New("not found")
		}
		return nil, err
	}
	defer rows.Close()
	res := make([]models.EventTrigger, 0)
	for rows.Next() {
		var cur models.EventTrigger
		var cred []byte
		rows.Scan(&cur.Type, &cur.Name, &cur.AccountId, &cur.Integration, &cur.Endpoint, &cred)
		json.Unmarshal(cred, &cur.Credentials)
		if err != nil {
			return nil, err
		}
		cur.MetaData = models.AvaliableTriggers[cur.Type]
		res = append(res, cur)
	}
	return res, nil
}
