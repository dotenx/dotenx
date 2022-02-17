package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/utopiops/automated-ops/ao-api/db"
)

func (ps *pipelineStore) GetTaskNameById(noContext context.Context, taskId int) (name string, err error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		err = conn.QueryRow(getTaskName, taskId).Scan(&name)
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

var getTaskName = `
select name
from tasks
where id = $1
LIMIT 1;
`
