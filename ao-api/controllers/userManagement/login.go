package userManagement

import (
	"net/http"
	"time"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

type loginInfo struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

/*
Example:
POST localhost:3004/auth/login

Body:
{
    "email": "abcdefg@gmail.com",
    "password": "A1b2C3d4E5f6G7"
}
*/

// Login function handles user login and if email and password are correct sets some info on session
func (umc *UserManagementController) Login() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var body loginInfo
		projectTag := ctx.Param("tag")
		if ctx.ShouldBindJSON(&body) != nil || body.Email == "" || body.Password == "" || projectTag == "" {
			ctx.Status(http.StatusBadRequest)
			return
		}

		// get user information from database
		user, err := umc.Service.GetUserInfo(body.Email, projectTag)
		if err != nil {
			if err.Error() == "user not found" {
				ctx.JSON(http.StatusNotFound, gin.H{
					"message": "username or password is incorrect",
				})
				return
			}
			ctx.Status(http.StatusInternalServerError)
			return
		}
		// checks equality of password that is in the body of the request and hashed password that is saved in database
		if ok := Authenticate(body.Password, user.Password); !ok {
			ctx.JSON(http.StatusNotFound, gin.H{
				"message": "username or password is incorrect",
			})
			return
		}
		project, err := umc.ProjectService.GetProjectByTag(projectTag)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		accessToken, err := utils.GenerateTpJwtToken(project.AccountId, user.AccountId)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		expTime := time.Now().Add(6 * time.Hour).Unix()
		ctx.JSON(http.StatusOK, gin.H{
			"message":        "User login successfully",
			"expirationTime": expTime,
			"accessToken":    accessToken,
		})
	}
}
