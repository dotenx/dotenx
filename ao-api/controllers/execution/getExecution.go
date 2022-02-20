package execution

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (e *ExecutionController) GetExecution() gin.HandlerFunc {
	return func(c *gin.Context) {

		accountId := c.MustGet("accountId").(string)
		execution, err := e.Service.GetExecution(accountId)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		c.JSON(http.StatusOK, execution)
	}
}
