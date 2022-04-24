package execution

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (e *ExecutionController) StartPipeline() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Status(http.StatusOK)

		accountId, _ := utils.GetAccountId(c)

		endpoint := c.Param("endpoint")
		var input map[string]interface{}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, err.Error())
			return
		}
		id, err := e.Service.StartPipeline(input, accountId, endpoint)
		if err != nil {
			if err.Error() == "automation is not active" {
				c.JSON(http.StatusBadRequest, err.Error())
				return
			}
			c.JSON(http.StatusInternalServerError, err.Error())
			return
		}
		c.JSON(http.StatusOK, gin.H{"id": id})
	}
}
