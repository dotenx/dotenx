package userManagement

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

/*
Example:
POST localhost:3004/auth/register

Body:
{
    "email": "abcdefg@gmail.com",
    "password": "A1b2C3d4E5f6G7",
	"fullname": "name of user"
}
*/

// Register function handles user register and store informations in the database
func (umc *UserManagementController) Register() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var userInfo models.ThirdUser
		userInfo.AccountId = uuid.New().String()
		projectTag := ctx.Param("tag")
		if err := ctx.ShouldBindJSON(&userInfo); err != nil || userInfo.Email == "" || userInfo.Password == "" || projectTag == "" {
			log.Println(err)
			ctx.Status(http.StatusBadRequest)
			return
		}

		defaultUserGroup, err := umc.Service.GetDefaultUserGroup(projectTag)
		if err != nil {
			log.Println(err)
			userInfo.UserGroup = "users"
		} else {
			userInfo.UserGroup = defaultUserGroup.Name
		}

		err = umc.Service.SetUserInfo(userInfo, projectTag)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		ctx.Status(http.StatusOK)
	}
}
