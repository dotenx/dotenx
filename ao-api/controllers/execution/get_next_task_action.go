package execution

import (
	"log"
	"net/http"
	"strconv"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/gin-gonic/gin"
)

func (e *ExecutionController) GetNextTask() gin.HandlerFunc {
	return func(c *gin.Context) {
		// accountId, _ := utils.GetAccountId(c)
		// queryString := c.Request.URL.Query()
		executionId, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		// status := queryString.Get("status")
		// taskId, err := strconv.Atoi(queryString.Get("taskId"))
		// if err != nil {
		// 	c.Status(http.StatusBadRequest)
		// 	return
		// }
		var dto models.TaskResultDto
		if err := c.ShouldBindJSON(&dto); err != nil {
			log.Println(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		err = e.Service.GetNextTask(dto.TaskId, executionId, dto.Status, dto.AccountId)
		if err != nil {
			log.Println(err.Error())
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		c.Status(http.StatusOK)
	}
}
