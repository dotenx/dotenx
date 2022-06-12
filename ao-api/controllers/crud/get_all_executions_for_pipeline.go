package crud

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (mc *CRUDController) GetListOfPipelineExecution() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := c.Param("name")
		accountId, _ := utils.GetAccountId(c)
		executions, err := mc.Service.GetAllExecutions(accountId, name)
		if err != nil {
			log.Println(err.Error())
			c.JSON(http.StatusInternalServerError, err)
			return
		}
		c.JSON(http.StatusOK, executions)

	}
}
