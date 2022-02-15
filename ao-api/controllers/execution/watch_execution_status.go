package execution

import (
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-contrib/sse"
	"github.com/gin-gonic/gin"
	"github.com/utopiops/automated-ops/ao-api/models"
)

func (e *ExecutionController) WatchExecutionStatus() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Status(http.StatusOK)

		executionId, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		type Execution struct {
			Id    int                        `json:"execution_id"`
			Tasks []models.TaskStatusSummery `json:"tasks"`
		}

		chanStream := make(chan Execution, 100)
		var lastSummeries []models.TaskStatusSummery
		done := make(chan bool)
		go func() {
			defer close(chanStream)
			for {
				tasks, err := e.Service.GetTasksWithStatusForExecution(executionId)
				if err != nil {
					fmt.Println(err.Error())
					done <- true
					break
				}
				if len(lastSummeries) > 0 && !isChanged(tasks, lastSummeries) {
					time.Sleep(time.Second)
					continue
				}
				lastSummeries = tasks
				chanStream <- Execution{Id: executionId, Tasks: tasks}
				time.Sleep(time.Second)
			}
		}()
		c.Stream(func(w io.Writer) bool {
			for {
				select {
				case <-done:
					c.SSEvent("end", "end")
					return false
				case msg := <-chanStream:
					//	fmt.Println("$$$$$$$$$$$$$$$$$")
					//fmt.Println(msg)
					//	fmt.Println("$$$$$$$$$$$$$$$$$")
					c.Render(-1, sse.Event{
						Event: "message",
						Data:  msg,
					})
					return true
				}
			}
		})
	}
}

func isExecutionDone(totalTasks int, currentTasks []models.TaskStatusSummery) bool {
	doneTasks := 0
	for _, task := range currentTasks {
		if task.Status == "completed" || task.Status == "failed" {
			doneTasks++
		}
	}
	return doneTasks == totalTasks
}
