package crud

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (mc *CRUDController) GetListOfPipelineExecution() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		accountId := c.MustGet("accountId").(string)
		executions, err := mc.Service.GetAllExecutions(accountId, name)
		if err != nil {
			c.JSON(http.StatusInternalServerError, err)
			return
		}
		c.JSON(http.StatusOK, executions)

	}
}
