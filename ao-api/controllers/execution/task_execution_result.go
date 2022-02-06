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
		if err.Error() == "Foreign key constraint violence" {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		c.Status(http.StatusOK)
	}
}

type taskResultDto struct {
	Status models.TaskStatus      `json:"status"`
	Result map[string]interface{} //Not used currently
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
