package execution

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (e *ExecutionController) GetExecution() gin.HandlerFunc {
	return func(c *gin.Context) {

		accountId, _ := utils.GetAccountId(c)
		execution, err := e.Service.GetExecution(accountId)
		if err != nil {
			log.Println(err.Error())
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		c.JSON(http.StatusOK, execution)
	}
}
