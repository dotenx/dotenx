package profile

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (pc *ProfileController) GetProfile() gin.HandlerFunc {
	return func(c *gin.Context) {
		resp := make(map[string]interface{})
		accountId, _ := utils.GetAccountId(c)
		resp["account_id"] = accountId
		if tokenType, exist := c.Get("tokenType"); exist {
			if tokenType == "tp" {
				tpAccountId, _ := c.Get("tpAccountId")
				resp["tp_account_id"] = tpAccountId
			}
		}

		c.JSON(http.StatusOK, resp)
	}
}
