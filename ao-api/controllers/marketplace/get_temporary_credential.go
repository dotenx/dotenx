package marketplace

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *MarketplaceController) GetTemporaryCredential() gin.HandlerFunc {
	return func(c *gin.Context) {

		type credDTO struct {
			UseCase string `json:"use_case"`
		}

		var dto credDTO
		if err := c.ShouldBindJSON(&dto); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}

		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}

		switch dto.UseCase {
		case "deploy_function":
			creds, err := controller.Service.GetTemporaryCredential(dto.UseCase, accountId)
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{
					"message": "we can't give a credentials to you now, please try again later",
				})
				return
			}
			c.JSON(http.StatusOK, gin.H{
				"access_key_id":     creds.AccessKeyId,
				"secret_access_key": creds.SecretAccessKey,
				"session_token":     creds.SessionToken,
				"expiration":        creds.Expiration,
			})
			return
		default:
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "unsupported use case, please check your use case value",
			})
			return
		}
	}

}
