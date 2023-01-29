package trigger

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *TriggerController) HandleEventBridgeScheduler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var dto struct {
			PipelineEndpoint string `json:"pipeline_endpoint"`
			AuthToken        string `json:"auth_token"`
		}

		if err := c.ShouldBindJSON(&dto); err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		if dto.AuthToken != config.Configs.Secrets.EventSchedulerToken {
			logrus.Error("invalid token")
			c.Status(http.StatusUnauthorized)
			return
		}

		err := controller.Service.HandleEventBridgeScheduler(dto.PipelineEndpoint)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.Status(http.StatusOK)
	}
}
