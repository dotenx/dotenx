package userManagement

import (
	"net/http"
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type queryString struct {
	Token string `form:"token"`
}

/*
	ResetPassword changes password of third party user (based on security token that peresnets in query parameters)
	also this handler checks that token hasn't expired and isn't use before
*/
func (umc *UserManagementController) ResetPassword() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var qs queryString
		projectTag := ctx.Param("tag")
		if ctx.ShouldBindQuery(&qs) != nil || qs.Token == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"message": "token in query parameter is empty",
			})
			return
		}

		var body loginInfo
		if ctx.ShouldBindJSON(&body) != nil || body.Password == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"message": "password field in body is empty",
			})
			return
		}

		forgetPass, err := umc.Service.GetSecurityCodeInfo(qs.Token, utils.ForgetPasswordUseCase, projectTag)
		if err != nil {
			logrus.Error(err.Error())
			ctx.JSON(http.StatusBadRequest, gin.H{
				"message": "can't find given token",
			})
			return
		}
		if !forgetPass.Usable {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"message": "token used already",
			})
			return
		}
		if forgetPass.ExpirationTime <= int(time.Now().Unix()) {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"message": "token expired",
			})
			return
		}

		// get user information from database
		user, err := umc.Service.GetUserInfo(forgetPass.Email, projectTag)
		if err != nil {
			if err.Error() == "user not found" {
				ctx.JSON(http.StatusNotFound, gin.H{
					"message": "email is incorrect",
				})
				return
			}
			logrus.Error(err.Error())
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"message": "can't find user by email",
			})
			return
		}

		newUserInfo := models.ThirdUser{
			AccountId: user.AccountId,
			Password:  body.Password,
		}
		err = umc.Service.UpdatePassword(newUserInfo, projectTag)
		if err != nil {
			logrus.Error(err.Error())
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"message": "can't update password",
			})
			return
		}

		err = umc.Service.DisableSecurityCode(qs.Token, utils.ForgetPasswordUseCase, projectTag)
		if err != nil {
			logrus.Error(err.Error())
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"message": "can't update state of token",
			})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"message": "Password updated successfully",
		})
	}
}
