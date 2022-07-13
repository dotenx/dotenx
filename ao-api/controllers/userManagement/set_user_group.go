package userManagement

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/gin-gonic/gin"
)

type setReq struct {
	TpEmail     string `json:"email"`
	TpAccountId string `json:"account_id"`
}

func (umc *UserManagementController) SetUserGroup() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body setReq
		projectTag := ctx.Param("tag")
		ugName := ctx.Param("name")
		if ctx.ShouldBindJSON(&body) != nil || (body.TpEmail == "" && body.TpAccountId == "") || projectTag == "" || ugName == "" {
			log.Println("body:", body)
			log.Println("projectTag:", projectTag)
			log.Println("ugName:", ugName)
			ctx.Status(http.StatusBadRequest)
			return
		}
		var user *models.ThirdUser
		var err error
		if body.TpEmail != "" {
			user, err = umc.Service.GetUserInfo(body.TpEmail, projectTag)
		} else if body.TpAccountId != "" {
			user, err = umc.Service.GetUserInfoById(body.TpAccountId, projectTag)
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
