package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/models"
)

func (p *pipelineStore) GetExecutionGraph(context context.Context, executionId int, accountId string) (pipeline models.PipelineVersion, name string, err error) {
	// In the future we can use different statements based on the db.Driver as per DB Engine
	pipeline.Manifest.Tasks = make(map[string]models.Task)
	pipeline.Manifest.Triggers = make(map[string]models.Trigger)

	switch p.db.Driver {
	case db.Postgres:
		conn := p.db.Connection

		err = conn.QueryRow(select_pipeline_by_version_graph, accountId, executionId).Scan(&pipeline.Id, &pipeline.FromVersion, &pipeline.Version, &name)
		if err != nil {
			if err == sql.ErrNoRows {
				err = errors.New("not found")
				return
			}
			logError(err)
			return
		}
		tasks := []models.Task{}
		var rows *sql.Rows
		rows, err = conn.Query(select_tasks_by_pipeline_version_id_graph, pipeline.Id)
		if err != nil {
			logError(err)
			return
		}
		for rows.Next() {
			task := models.Task{}
			err = rows.Scan(&task.Id, &task.Name, &task.Type, &task.Description)
			if err != nil {
				logError(err)
				return
			}
			tasks = append(tasks, task)
		}
		taskIdToName := make(map[int]string)
		for _, task := range tasks {
			log.Println(task.Name)
			taskIdToName[task.Id] = task.Name
		}
		for _, task := range tasks {
			preconditions := []struct {
				PreconditionId int    `db:"precondition_id"`
				Status         string `db:"status"`
			}{}
			err = conn.Select(&preconditions, select_preconditions_by_task_id_graph, task.Id)
			if err != nil {
				logError(err)
				return
			}
			task.ExecuteAfter = make(map[string][]string)
			for _, precondition := range preconditions {
				task.ExecuteAfter[taskIdToName[precondition.PreconditionId]] = append(task.ExecuteAfter[taskIdToName[precondition.PreconditionId]], precondition.Status)
			}
			pipeline.Manifest.Tasks[task.Name] = models.Task{
				Id:           task.Id,
				ExecuteAfter: task.ExecuteAfter,
				Type:         task.Type,
				Body:         task.Body,
				Description:  task.Description,
			}
		}
		triggers := []struct {
			Id   int
			Name string
			models.Trigger
		}{}
		err = conn.Select(&triggers, select_trigger_by_pipeline_version_id_graph, pipeline.Id)
		if err != nil {
			logError(err)
			return
		}
		for _, trigger := range triggers {
			pipeline.Manifest.Triggers[trigger.Name] = trigger.Trigger
		}
	}
	return
}

var select_pipeline_by_version_graph = `
SELECT pv.id as id, pv.from_version, pv.version, p.name
FROM executions e
JOIN pipeline_versions pv ON e.pipeline_version_id = pv.id
JOIN pipelines p ON p.id = pv.pipeline_id
WHERE p.account_id = $1 AND e.id = $2
`

// The main difference with GetByVersion is here: we don't retrieve the body
var select_tasks_by_pipeline_version_id_graph = `
SELECT id, name, task_type, description FROM tasks
WHERE pipeline_version_id = $1
`
var select_preconditions_by_task_id_graph = `
SELECT precondition_id, status FROM task_preconditions
WHERE task_id = $1
`

var select_trigger_by_pipeline_version_id_graph = `
SELECT id, name, trigger_type FROM triggers
WHERE pipeline_version_id = $1
`
