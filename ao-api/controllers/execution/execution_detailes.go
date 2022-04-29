package execution

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (mc *ExecutionController) GetExecutionDetailes() gin.HandlerFunc {
	return func(c *gin.Context) {

		executionId, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid execution id"})
			return
		}
		detailes, err := mc.Service.GetExecutionDetailes(executionId)
		if err != nil {
			log.Println(err)
			c.JSON(http.StatusInternalServerError, err.Error())
			return
		}
		c.JSON(http.StatusOK, detailes)
	}
}
