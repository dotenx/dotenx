package trigger

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *TriggerController) HandleScheduledTriggers() gin.HandlerFunc {
	return func(c *gin.Context) {
		var dto struct {
			PipelineEndpoint string `json:"pipeline_endpoint"`
			AccountId        string `json:"account_id"`
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

		err := controller.Service.HandleScheduledTriggers(dto.PipelineEndpoint, dto.AccountId)
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
