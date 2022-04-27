package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/dotenx/dotenx/ao-api/db"
)

func (ps *pipelineStore) GetPipelineId(context context.Context, accountId, name string) (id int, err error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		err = conn.QueryRow(getPipelineId, accountId, name).Scan(&id)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return
		}
	}
	return
}

func (ps *pipelineStore) GetPipelineNameById(context context.Context, accountId string, pipelineId int) (pipelineName string, err error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		err = conn.QueryRow(getPipelineName, accountId, pipelineId).Scan(&pipelineName)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return
		}
	}
	return
}

var getPipelineId = `
select id
from pipelines
where account_id = $1 and name = $2
LIMIT 1;
`

var getPipelineName = `
select name
from pipelines
where account_id = $1 and id = $2
LIMIT 1;
`
