package execution

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"

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

func (e *ExecutionController) TaskExecutionResult() gin.HandlerFunc {
	return func(c *gin.Context) {
		runnerToken := c.GetHeader("authorization")
		if runnerToken != config.Configs.Secrets.RunnerToken {
			log.Println("invalid runner token: " + runnerToken)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid runner token"})
			return
		}
		executionId, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			log.Println(err)
			c.Status(http.StatusBadRequest)
			return
		}

		taskId, err := strconv.Atoi(c.Param("taskId"))
		if err != nil {
			log.Println(err)
			c.Status(http.StatusBadRequest)
			return
		}

		var taskResultDto taskResultDto

		if err := c.ShouldBindJSON(&taskResultDto); err != nil {
			jsonData, err := ioutil.ReadAll(c.Request.Body)
			log.Println("Request Body:", string(jsonData))
			log.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		err = e.Service.SetTaskExecutionResult(executionId, taskId, taskResultDto.Status.String())
		if err != nil && err.Error() == "Foreign key constraint violence" {
			log.Println(err)
			c.AbortWithError(http.StatusBadRequest, err)
			return
		} else if err != nil {
			log.Println(err.Error())
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		err = e.Service.SetTaskExecutionResultDetails(executionId, taskId, taskResultDto.Status.String(), taskResultDto.ReturnValue, taskResultDto.Log)
		if err != nil && err.Error() == "Foreign key constraint violence" {
			log.Println(err)
			c.AbortWithError(http.StatusBadRequest, err)
			return
		} else if err != nil {
			log.Println(err.Error())
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		c.Status(http.StatusOK)
	}
}

type taskResultDto struct {
	Status      models.TaskStatus     `json:"status"`
	ReturnValue models.ReturnValueMap `json:"return_value"`
	Log         string                `json:"log"`
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
