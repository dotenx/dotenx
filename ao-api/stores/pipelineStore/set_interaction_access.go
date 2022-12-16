package pipelineStore

import (
	"database/sql"
	"errors"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/sirupsen/logrus"
)

func (ps *pipelineStore) SetInteractionAccess(pipelineId string, isPublic bool) (err error) {

	var setInteractionAccess = `
UPDATE pipelines
SET is_public=$1
WHERE id=$2 AND is_interaction=TRUE
`

	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		res, err := conn.Exec(setInteractionAccess, isPublic, pipelineId)
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
