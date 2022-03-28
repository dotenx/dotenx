package execution

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/utopiops/automated-ops/ao-api/pkg/utils"
)

func (mc *ExecutionController) GetInitialData() gin.HandlerFunc {
	return func(c *gin.Context) {

		executionId, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.Status(http.StatusBadRequest)
			return
		}

		accountId, _ := utils.GetAccountId(c)

		initialData, statusCode := mc.Service.GetInitialData(executionId, accountId)
		if statusCode != http.StatusOK {
			c.Status(statusCode)
			return
		}
		c.JSON(statusCode, initialData)
	}
}
