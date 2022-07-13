package userManagement

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/gin-gonic/gin"
)

type setReq struct {
	tpEmail     string `json:"email"`
	tpAccountId string `json:"account_id"`
}

func (umc *UserManagementController) SetUserGroup() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body setReq
		projectTag := ctx.Param("tag")
		ugName := ctx.Param("name")
		if ctx.ShouldBindJSON(&body) != nil || (body.tpEmail == "" && body.tpAccountId == "") || projectTag == "" || ugName == "" {
			ctx.Status(http.StatusBadRequest)
			return
		}
		var user *models.ThirdUser
		var err error
		if body.tpEmail != "" {
			user, err = umc.Service.GetUserInfo(body.tpEmail, projectTag)
		} else if body.tpAccountId != "" {
			user, err = umc.Service.GetUserInfoById(body.tpAccountId, projectTag)
		}
		if err != nil {
			if err.Error() == "user not found" {
				ctx.JSON(http.StatusNotFound, gin.H{
					"message": "accountId is incorrect",
				})
				return
			}
			ctx.Status(http.StatusInternalServerError)
			return
		}
		user.UserGroup = ugName

		err = umc.Service.UpdateUserGroup(*user, projectTag)
		if err != nil {
			log.Println(err.Error())
			ctx.Status(http.StatusInternalServerError)
			return
		}
		ctx.Status(http.StatusOK)
	}
}
