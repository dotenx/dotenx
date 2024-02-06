package internalController

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *InternalController) HandleDomainPurchase() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		type body struct {
			AccountId  string `json:"accountId"`
			ProjectTag string `json:"projectTag"`
			DomainName string `json:"domainName"`
		}
		var dto body
		if err := ctx.ShouldBindJSON(&dto); err != nil {
			logrus.Error(err.Error())
			ctx.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		err := controller.Service.HandleDomainPurchase(dto.AccountId, dto.ProjectTag, dto.DomainName)
		if err != nil {
			logrus.Error(err.Error())
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}

		ctx.Status(http.StatusOK)
	}
}
