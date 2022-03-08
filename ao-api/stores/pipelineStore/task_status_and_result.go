package pipelineStore

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"strings"

	"github.com/lib/pq"
	"github.com/utopiops/automated-ops/ao-api/db"
	"github.com/utopiops/automated-ops/ao-api/models"
)

func (ps *pipelineStore) SetTaskResult(context context.Context, executionId int, taskId int, status string) (err error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		tx, _ := conn.BeginTx(context, nil)
		count := 0
		err = tx.QueryRow(checkIfTaskStatusAlreadySet, executionId, taskId).Scan(&count)
		if err != nil && err != sql.ErrNoRows {
			return err
		}
		var query string
		if count == 0 {
			query = addTaskResult
		} else {
			// NOTE: Currently we allow the result to be overwritten which should be only in case we have
			// for some reason received timeout before the result, but it doesn't care even if the current
			// result is sth other than timeout
			query = updateTaskResult
		}
		_, err = tx.Exec(query, executionId, taskId, status)
		if err != nil {
			log.Println(err.Error())
			if pgErr, isPGErr := err.(*pq.Error); isPGErr {
				if pgErr.Code == ForeignKeyViolationErrorCode {
					return errors.New("foreign key constraint violence")
				}
			}
			return err
		}
		err = tx.Commit()
		return err
	}
	return
}
func (ps *pipelineStore) GetTaskResultDetailes(context context.Context, executionId int, taskId int) (interface{}, error) {
	var taskRes struct {
		Status      string                `json:"status"`
		Log         string                `json:"log"`
		ReturnValue models.ReturnValueMap `json:"return_value"`
	}
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		var body interface{}
		var taskBody models.ReturnValueMap
		err := conn.QueryRow(getTaskResult, executionId, taskId).Scan(&taskRes.Status, &taskRes.Log, &body)
		if body != nil {
			json.Unmarshal(body.([]byte), &taskBody)
			taskRes.ReturnValue = taskBody
		}
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				err = errors.New("not found")
			}
			return nil, err
		}
	}
	return taskRes, nil

}

func (ps *pipelineStore) SetTaskResultDetailes(context context.Context, executionId int, taskId int, status string, returnValue models.ReturnValueMap, logs string) (err error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		tx, _ := conn.BeginTx(context, nil)
		count := 0
		err = tx.QueryRow(checkIfTaskResultAlreadySet, executionId, taskId).Scan(&count)
		if err != nil && err != sql.ErrNoRows {
			return err
		}
		var query string
		if count == 0 {
			query = addTaskResultDetailes
		} else {
			// NOTE: Currently we allow the result to be overwritten which should be only in case we have
			// for some reason received timeout before the result, but it doesn't care even if the current
			// result is sth other than timeout
			query = updateTaskResultDetailes
		}
		logs = strings.ReplaceAll(logs, "\u0000", "")
		_, err = tx.Exec(query, executionId, taskId, status, returnValue, string(logs))
		if err != nil {
			log.Println(err.Error())
			if pgErr, isPGErr := err.(*pq.Error); isPGErr {
				if pgErr.Code == ForeignKeyViolationErrorCode {
					return errors.New("foreign key constraint violence")
				}
			}
			return err
		}
		err = tx.Commit()
		return err
	}
	return
}

func (ps *pipelineStore) SetTaskStatusToTimedout(context context.Context, executionId int, taskId int) (err error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		tx, _ := conn.BeginTx(context, nil)
		count := 0
		err = tx.QueryRow(checkIfTaskStatusAlreadySet, executionId, taskId).Scan(&count)
		if err != nil && err != sql.ErrNoRows {
			return err
		}
		if count == 0 {
			_, err = tx.Exec(setTaskStatusToTimedout, executionId, taskId)
			if err != nil {
				log.Println(err.Error())
				return err
			}
			err = tx.Commit()
			return err
		} else {
			tx.Rollback()
		}
	}
	return
}

var checkIfTaskStatusAlreadySet = `
SELECT count(*) FROM executions_status
WHERE execution_id = $1 AND task_id = $2;
`

var checkIfTaskResultAlreadySet = `
SELECT count(*) FROM executions_result
WHERE execution_id = $1 AND task_id = $2;
`

var getTaskResult = `
SELECT status, log, return_value FROM executions_result
WHERE execution_id = $1 AND task_id = $2;
`

var setTaskStatusToTimedout = `
INSERT INTO executions_status(
execution_id, task_id, status)
VALUES ($1, $2, 'Timedout');
`

var addTaskResult = `
INSERT INTO executions_status(
execution_id, task_id, status)
VALUES ($1, $2, $3);
`
var addTaskResultDetailes = `
INSERT INTO executions_result(
execution_id, task_id, status, return_value, log)
VALUES ($1, $2, $3, $4, $5);
`

var updateTaskResult = `
UPDATE executions_status
SET execution_id=$1, task_id=$2, status=$3
WHERE execution_id = $1 AND task_id = $2;
`
var updateTaskResultDetailes = `
UPDATE executions_result
SET execution_id=$1, task_id=$2, status=$3, return_value=$4, log=$5
WHERE execution_id = $1 AND task_id = $2;
`
