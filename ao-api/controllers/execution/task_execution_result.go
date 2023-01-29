package execution

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (e *ExecutionController) GetTaskExecutionResultByName() gin.HandlerFunc {
	return func(c *gin.Context) {

		executionId, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}

		taskName := c.Param("task_name")
		if taskName == "" || executionId == 0 {
			c.Status(http.StatusBadRequest)
			return
		}

		taskId, err := e.Service.GetTaskId(executionId, taskName)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "error in getting taskId, invalid task name"})
			return
		}

		res, err := e.Service.GetTaskExecutionResult(executionId, taskId)
		if err != nil && err.Error() == "Foreign key constraint violence" {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		} else if err != nil {
			log.Println(err.Error())
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		c.JSON(http.StatusOK, res)
	}
}
func (e *ExecutionController) GetTaskExecutionResult() gin.HandlerFunc {
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

		res, err := e.Service.GetTaskExecutionResult(executionId, taskId)
		if err != nil && err.Error() == "Foreign key constraint violence" {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		} else if err != nil {
			log.Println(err.Error())
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		c.JSON(http.StatusOK, res)
	}
}
