package pipelineStore

import (
	"context"
	"errors"
	"log"

	"github.com/dotenx/dotenx/ao-api/db"
	"github.com/dotenx/dotenx/ao-api/models"
)

// Store the pipeline
func (j *pipelineStore) Create(context context.Context, base *models.Pipeline, pipeline *models.PipelineVersion, isTemplate bool, isInteraction bool, projectName string, parent_id int, createdFor string) error {
	// In the future we can use different statements based on the db.Driver as per DB Engine
	switch j.db.Driver {
	case db.Postgres:
		tx := j.db.Connection.MustBegin()
		var pipelineId int
		var count int
		log.Println(base.Name, base.AccountId)
		// Check if pipeline already exists
		err := tx.Get(&count, get_pipeline_count, base.AccountId, base.Name, projectName)
		if err != nil {
			return err
		}
		if count != 0 {
			return errors.New("pipeline already exists")
		}
		// Add the pipeline
		err = tx.QueryRow(create_pipeline, base.Name, base.AccountId, isTemplate, isInteraction, projectName, parent_id, createdFor).Scan(&pipelineId)
		if err != nil {
			return err
		}

		preconditions := make(map[string]struct {
			taskId       int
			executeAfter map[string][]string
		})

		// Insert all the tasks first (reason: FK constraint)
		for name, task := range pipeline.Manifest.Tasks {
			var taskId int
			err := tx.QueryRow(create_task, name, task.Type, task.AwsLambda, task.Integration, base.AccountId, "description", pipelineId, task.Body).Scan(&taskId)
			if err != nil {
				return err
			}
			preconditions[name] = struct {
				taskId       int
				executeAfter map[string][]string
			}{
				taskId:       taskId,
				executeAfter: task.ExecuteAfter,
			}
		}

		// Insert the preconditions
		for _, current := range preconditions {
			for name, statusList := range current.executeAfter {
				executeAfterId := preconditions[name].taskId
				for _, status := range statusList {
					//todo handle foreign key err
					tx.MustExec(create_task_precondition, current.taskId, executeAfterId, status)
				}
			}
		}

		err = tx.Commit()
		return err
	}
	return nil
}

// Select queries
const get_pipeline_count = `
SELECT COUNT(*) FROM pipelines
WHERE account_id = $1 AND name = $2 AND project_name = $3
`

// Insert queries

const create_pipeline = `
INSERT INTO pipelines (name, account_id, is_template, is_interaction, project_name, parent_id, created_for)
VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
`

const create_task = `
INSERT INTO tasks (name, task_type, aws_lambda, integration, account_id, description, pipeline_id, body)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
`
const create_task_precondition = `
INSERT INTO task_preconditions (task_id, precondition_id, status)
VALUES ($1, $2, $3)
`
