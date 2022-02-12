package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"time"

	"github.com/utopiops/automated-ops/ao-api/db"
)

func (p *pipelineStore) Activate(context context.Context, accountId string, name string, version int16) error {
	switch p.db.Driver {
	case db.Postgres:
		conn := p.db.Connection
		tx := conn.MustBegin()
		var pipelineVersionId, activatedVersion, pipelineId int64

		err := tx.Get(&pipelineVersionId, getPipelineVersionIdByVersion, accountId, name, version)
		log.Println("pipelineVersionId", pipelineVersionId)
		if err != nil {
			if err == sql.ErrNoRows {
				err = errors.New("invalid pipeline name or base version")
			}
			return err
		}
		// Get the id of the pipeline by name
		err = tx.Get(&pipelineId, selectPipelineIdByName, accountId, name)
		log.Println("pipelineId", pipelineId)
		if err != nil {
			if err == sql.ErrNoRows {
				err = errors.New("invalid pipeline name or base version")
			}
			return err
		}
		// Check if this pipeline has ever been activated
		err = tx.Get(&activatedVersion, selectExistingActivatedPipeline, pipelineId)
		if err != nil { // if not
			if err == sql.ErrNoRows {
				// insert
				now := time.Now()
				utc := now.UTC()
				_, err = tx.Exec(insertActivation, pipelineId, pipelineVersionId, utc)
				if err != nil {
					return err
				}
				err = tx.Commit()
				if err != nil {
					return err
				}
				return nil
			} else {
				return err
			}
		}
		// update if different version being activated
		if activatedVersion != pipelineVersionId {
			now := time.Now()
			utc := now.UTC()
			_, err = tx.Exec(updateActivation, pipelineId, pipelineVersionId, utc)
			if err != nil {
				return err
			}
			err = tx.Commit()
			if err != nil {
				return err
			}
		}
	}
	return nil
}

var getPipelineVersionIdByVersion = `
SELECT pv.id as id
FROM pipeline_versions pv JOIN pipelines p ON pv.pipeline_id = p.id
WHERE p.account_id = $1 AND p.name = $2 AND version = $3
`

var selectPipelineIdByName = `
SELECT id FROM pipelines
WHERE account_id = $1 AND name = $2 FOR UPDATE
`

var selectExistingActivatedPipeline = `
SELECT activated_version FROM pipeline_activations
WHERE pipeline_id = $1 FOR UPDATE
`

var insertActivation = `
INSERT INTO pipeline_activations (pipeline_id, activated_version, last_activation)
VALUES ($1, $2, $3)
`
var updateActivation = `
UPDATE pipeline_activations 
SET activated_version = $2, 
last_activation = $3
WHERE pipeline_id = $1
`
