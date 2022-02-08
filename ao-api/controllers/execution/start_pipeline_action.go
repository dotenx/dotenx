package execution

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (e *ExecutionController) StartPipeline() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Status(http.StatusOK)

		// Get the `input data` from the request body

		accountId := c.MustGet("accountId").(string)

		endpoint := c.Param("endpoint")
		var input map[string]interface{}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.Status(http.StatusBadRequest)
			return
		}
		fmt.Println("##################")
		id, err := e.Service.StartPipeline(input, accountId, endpoint)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		c.JSON(http.StatusOK, gin.H{"id": id})
	}
}
