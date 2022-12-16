package profile

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (pc *ProfileController) GetProfile() gin.HandlerFunc {
	return func(c *gin.Context) {
		projectTag := c.Param("project_tag")
		resp := make(map[string]interface{})
		accountId, _ := utils.GetAccountId(c)
		resp["account_id"] = accountId
		if tokenType, exist := c.Get("tokenType"); exist {
			if tokenType == "tp" {
				tpAccountId, _ := utils.GetThirdPartyAccountId(c)
				resp["tp_account_id"] = tpAccountId
				user, err := pc.Service.GetUserInfoById(tpAccountId, projectTag)
				if err != nil {
					logrus.Error(err.Error())
					c.JSON(http.StatusBadRequest, gin.H{
						"message": err.Error(),
					})
				}
				resp["email"] = user.Email
				resp["full_name"] = user.FullName
				resp["user_group"] = user.UserGroup
				resp["created_at"] = user.CreatedAt
			}
		}

		c.JSON(http.StatusOK, resp)
	}
}
