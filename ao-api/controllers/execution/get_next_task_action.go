package execution

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/utopiops/automated-ops/ao-api/models"
)

func (e *ExecutionController) GetNextTask() gin.HandlerFunc {
	return func(c *gin.Context) {
		// accountId := c.MustGet("accountId").(string)
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
			log.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		err = e.Service.GetNextTask(dto.TaskId, executionId, dto.Status, dto.AccountId)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		c.Status(http.StatusOK)
	}
}
