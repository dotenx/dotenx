package pipelineStore

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log"

	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/models"
)

func (p *pipelineStore) GetByVersion(context context.Context, version int16, accountId string, name string) (pipeline models.PipelineVersion, endpoint string, err error) {
	// In the future we can use different statements based on the db.Driver as per DB Engine
	pipeline.Version = version
	pipeline.Manifest.Tasks = make(map[string]models.Task)
	pipeline.Manifest.Triggers = make(map[string]models.Trigger)

	switch p.db.Driver {
	case db.Postgres:
		conn := p.db.Connection
		var nullableServiceAccount sql.NullString
		err = conn.QueryRow(select_pipeline_by_version, accountId, name, version).Scan(&pipeline.Id, &pipeline.FromVersion, &endpoint, &nullableServiceAccount)
		if nullableServiceAccount.Valid {
			pipeline.ServiceAccount = nullableServiceAccount.String
		}
		if err != nil {
			if err == sql.ErrNoRows {
				err = errors.New("not found")
				return
			}
			log.Println("error", err.Error())
			return
		}
		log.Println(pipeline.Id, accountId)
		tasks := []models.Task{}
		var rows *sql.Rows
		rows, err = conn.Query(select_tasks_by_pipeline_version_id, pipeline.Id)
		if err != nil {
			log.Println("error", err.Error())
			return
		}
		for rows.Next() {
			task := models.Task{}
			var body interface{}
			err = rows.Scan(&task.Id, &task.Name, &task.Type, &task.Description, &body)
			if err != nil {
				return
			}
			switch task.Type { //TODO: This is super ugly. Fix this shit
			case models.HttpCall:
				var taskBody models.HttpCallTaskBody
				json.Unmarshal(body.([]byte), &taskBody)
				task.Body = taskBody
			case models.GitlabAddMember:
				var taskBody models.GitlabAddMemberTaskBody
				json.Unmarshal(body.([]byte), &taskBody)
				task.Body = taskBody
			case models.GitlabRemoveMember:
				var taskBody models.GitlabRemoveMemberTaskBody
				json.Unmarshal(body.([]byte), &taskBody)
				task.Body = taskBody
			case models.Default:
				var taskBody models.DefaultTaskBody
				json.Unmarshal(body.([]byte), &taskBody)
				task.Body = taskBody
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
			err = conn.Select(&preconditions, select_preconditions_by_task_id, task.Id)
			if err != nil {
				return
			}
			task.ExecuteAfter = make(map[string][]string)
			for _, precondition := range preconditions {
				task.ExecuteAfter[taskIdToName[precondition.PreconditionId]] = append(task.ExecuteAfter[taskIdToName[precondition.PreconditionId]], precondition.Status)
			}
			pipeline.Manifest.Tasks[task.Name] = models.Task{
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
		err = conn.Select(&triggers, select_trigger_by_pipeline_version_id, pipeline.Id)
		if err != nil {
			return
		}
		for _, trigger := range triggers {
			pipeline.Manifest.Triggers[trigger.Name] = trigger.Trigger
		}
	}
	return pipeline, endpoint, nil
}

var select_pipeline_by_version = `
SELECT pv.id as id, pv.from_version, p.endpoint, pv.service_account
FROM pipeline_versions pv JOIN pipelines p ON pv.pipeline_id = p.id
WHERE p.account_id = $1 AND p.name = $2 AND version = $3
`
var select_tasks_by_pipeline_version_id = `
SELECT id, name, task_type, description, body FROM tasks
WHERE pipeline_version_id = $1
`
var select_preconditions_by_task_id = `
SELECT precondition_id, status FROM task_preconditions
WHERE task_id = $1
`
var select_trigger_by_pipeline_version_id = `
SELECT id, name, trigger_type FROM triggers
WHERE pipeline_version_id = $1
`
