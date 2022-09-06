package userManagement

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

/*
	DeleteUser handler handles deleting a third party user from user_info table of database
	in this handler we check that if user is 'tp' then account id of he/she should be equal to
	account id that we get from token otherwise he/she receive 403 as response
*/

func (umc *UserManagementController) DeleteUser() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		projectTag := ctx.Param("tag")

		var body setReq
		if ctx.ShouldBindJSON(&body) != nil || body.TpAccountId == "" || projectTag == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"message": "you should set account id in body",
			})
			return
		}

		tokenType, _ := ctx.Get("tokenType")
		if tokenType == "tp" {
			accId, _ := utils.GetThirdPartyAccountId(ctx)
			if accId != body.TpAccountId {
				ctx.JSON(http.StatusForbidden, gin.H{
					"message": "you haven't access to delete this user",
				})
				return
			}
		}

		err := umc.Service.DeleteUserInfo(body.TpAccountId, projectTag)
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
