package health

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (jlc *HealthCheckController) GetStatus() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Status(http.StatusOK)
	}
}
