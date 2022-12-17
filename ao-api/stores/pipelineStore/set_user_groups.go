package pipelineStore

import (
	"database/sql"
	"errors"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/lib/pq"
	"github.com/sirupsen/logrus"
)

func (ps *pipelineStore) SetUserGroups(pipelineId string, userGroups []string) (err error) {

	logrus.Debug("SetUserGroups: ", userGroups)

	var setInteractionAccess = `
UPDATE pipelines
SET user_groups=$1
WHERE id=$2 AND (is_interaction=TRUE OR is_template=TRUE)
`

	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		res, err := conn.Exec(setInteractionAccess, pq.StringArray(userGroups), pipelineId)
		if err != nil {
			logrus.Error(err.Error())
			if err == sql.ErrNoRows {
				return errors.New("pipeline not found")
			}
			return err
		}
		ef, err := res.RowsAffected()
		if err != nil {
			return err
		}
		if ef == 0 {
			return errors.New("error in setting access")
		}
		return nil
	}
	return nil
}
