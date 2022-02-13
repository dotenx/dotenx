package execution

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/utopiops/automated-ops/ao-api/models"

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
		}
		c.JSON(http.StatusOK, res)
	}
}

func (e *ExecutionController) TaskExecutionResult() gin.HandlerFunc {
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

		var taskResultDto taskResultDto
		if err := c.ShouldBindJSON(&taskResultDto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err = e.Service.SetTaskExecutionResult(executionId, taskId, taskResultDto.Status.String(), taskResultDto.Result)
		if err != nil && err.Error() == "Foreign key constraint violence" {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		err = e.Service.SetTaskExecutionResultDetailes(executionId, taskId, taskResultDto.Status.String(), taskResultDto.ReturnValue, taskResultDto.Log)
		if err != nil && err.Error() == "Foreign key constraint violence" {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		c.Status(http.StatusOK)
	}
}

type taskResultDto struct {
	Status      models.TaskStatus      `json:"status"`
	ReturnValue string                 `json:"return_value"`
	Log         string                 "log"
	Result      map[string]interface{} //Not used currently
}

func (t taskResultDto) Value() (driver.Value, error) {
	return json.Marshal(t)
}

func (t taskResultDto) Scan(value interface{}) error {
	if bytes, ok := value.([]byte); ok {
		return json.Unmarshal(bytes, &t)
	} else {
		return errors.New("type assertion to []byte failed")
	}
}
