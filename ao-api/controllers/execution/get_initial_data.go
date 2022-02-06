package execution

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (mc *ExecutionController) GetInitialData() gin.HandlerFunc {
	return func(c *gin.Context) {

		executionId, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}

		accountId := c.MustGet("accountId").(string)

		initialData, statusCode := mc.Service.GetInitialData(executionId, accountId)
		if statusCode != http.StatusOK {
			c.Status(statusCode)
			return
		}
		c.JSON(statusCode, initialData)
	}
}
