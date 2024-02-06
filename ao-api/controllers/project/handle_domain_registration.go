package project

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (pc *ProjectController) HandleDomainRegistration() gin.HandlerFunc {
	return func(c *gin.Context) {
		var dto struct {
			AccountId    string `json:"account_id"`
			ProjectTag   string `json:"project_tag"`
			DomainName   string `json:"domain_name"`
			OperationId  string `json:"operation_id"`
			ScheduleName string `json:"schedule_name"`
			AuthToken    string `json:"auth_token"`
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

		err := pc.Service.HandleDomainRegistration(dto.AccountId, dto.ProjectTag, dto.OperationId, dto.ScheduleName)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.Status(http.StatusOK)
	}
}
