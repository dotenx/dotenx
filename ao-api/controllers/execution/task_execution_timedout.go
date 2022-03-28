package execution

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (e *ExecutionController) TaskExecutionTimedout() gin.HandlerFunc {
	return func(c *gin.Context) {

		executionId, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}

		taskId, err := strconv.Atoi(c.Param("taskId"))
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}

		err = e.Service.SetTaskStatusToTimedout(executionId, taskId)
		if err != nil {
			log.Println(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}
		c.Status(http.StatusOK)
	}
}
