package execution

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/utopiops/automated-ops/ao-api/pkg/utils"
)

func (e *ExecutionController) StartPipelineByName() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)

		name := c.Param("name")
		// Get the `input data` from the request body
		var input map[string]interface{}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		id, err := e.Service.StartPipelineByName(input, accountId, name)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		c.JSON(http.StatusOK, gin.H{"id": id})
	}
}
