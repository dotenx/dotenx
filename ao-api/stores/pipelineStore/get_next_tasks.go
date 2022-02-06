package pipelineStore

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/utopiops/automated-ops/ao-api/db"
)

func (ps *pipelineStore) GetNextTasks(context context.Context, executionId int, taskId int, status string) (taskIds []int, err error) {
	switch ps.db.Driver {
	case db.Postgres:
		conn := ps.db.Connection
		err = conn.Select(&taskIds, getNextTasks, taskId, executionId)
		if err != nil {
			log.Println(err.Error())
			if err == sql.ErrNoRows {
				return nil, errors.New("not found")
			}
		}
	}
	return

}

var getNextTasks = `
select
   sl.task_id
from
   (
      select
         tp1.task_id,
         tp1.precondition_id,
         tp1.status 
      from
         task_preconditions tp1 
      where
         tp1.task_id in 
         (
            select
               t.id 
            from
               tasks t 
               join
                  task_preconditions tp 
                  on t.id = tp.task_id 
            where
               tp.precondition_id = $1 
         )
   )
   sl -- the taks which $1 is one their preconditions 
   join -- join with the tasks with the staus of the tasks in execution $2 to find the records having their precond met
      executions_status es 
      on sl.precondition_id = es.task_id 
      and sl.status = es.status 
where
   es.execution_id = $2 
group by
   sl.task_id 
having		-- the number of task's met preconditions should equal the number tasks' preconditions
   count (*) = 
   (
      select
         count (*) 
      from
         (
            select
			   distinct  -- as the preconditions are expressed as or (in multiple rows with same precondition task id and different statuses) we count each task-precondition pair once
               tp1.task_id,
               tp1.precondition_id
            from
               task_preconditions tp1 
            where
               tp1.task_id in 
               (
                  select
                     t.id 
                  from
                     tasks t 
                     join
                        task_preconditions tp 
                        on t.id = tp.task_id 
                  where
                     tp.precondition_id = $1 
               )
         )
         sl2 
      where
         sl2.task_id = sl.task_id 
      group by
         sl2.task_id
   )
;
`
