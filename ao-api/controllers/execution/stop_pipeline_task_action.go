package execution

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (e *ExecutionController) StopPipelineTask() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Status(http.StatusOK)
	}
}
