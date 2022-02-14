package execution

import (
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-contrib/sse"
	"github.com/gin-gonic/gin"
	"github.com/utopiops/automated-ops/ao-api/models"
)

func (e *ExecutionController) WatchExecutionStatus() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Status(http.StatusOK)
		accountId := c.MustGet("accountId").(string)

		pipeLineName := c.Param("name")

		executionId, err := e.Service.GetExecutionIdForPipeline(accountId, pipeLineName)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
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

func isChanged(inputSummeries, lastSummeries []models.TaskStatusSummery) bool {
	for _, inTask := range inputSummeries {
		for _, oldTask := range lastSummeries {
			//fmt.Println("OOOOOOOOOOOOOOOOOOO")
			if inTask.Name == oldTask.Name {
				if inTask.Status != oldTask.Status {
					return true
				}
			}
		}
	}
	return false
}
