package userManagement

import (
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type setReq struct {
	TpAccountId string `json:"account_id"`
}

func (umc *UserManagementController) SetUserGroup() gin.HandlerFunc {
	return func(c *gin.Context) {
		var body setReq
		projectTag := c.Param("tag")
		ugName := c.Param("name")
		if c.ShouldBindJSON(&body) != nil || body.TpAccountId == "" || projectTag == "" || ugName == "" {
			log.Println("body:", body)
			log.Println("projectTag:", projectTag)
			log.Println("ugName:", ugName)
			c.Status(http.StatusBadRequest)
			return
		}
		user, err := umc.Service.GetUserInfoById(body.TpAccountId, projectTag)

		if err != nil {
			if err.Error() == "user not found" {
				c.JSON(http.StatusNotFound, gin.H{
					"message": "accountId is incorrect",
				})
				return
			}
			c.Status(http.StatusInternalServerError)
			return
		}
		user.UserGroup = ugName
		tokenType, exist := c.Get("tokenType")
		if !exist {
			err := errors.New("missing type field of token")
			c.AbortWithError(http.StatusForbidden, err)
			return
		}
		if tokenType != "tp" {
			err = umc.Service.UpdateUserGroup(*user, projectTag)
			if err != nil {
				log.Println(err.Error())
				c.Status(http.StatusInternalServerError)
				return
			}
			c.Status(http.StatusOK)
			return
		}
		// TODO run query to update user info table
	}
}
