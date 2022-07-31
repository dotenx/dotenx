package middlewares

import (
	"errors"
	"net/http"
	"strings"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func LocalTokenTypeMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.Request.Header.Get("Authorization")
		if authHeader != "" {
			if len(strings.SplitN(authHeader, "Bearer", 2)) != 2 {
				err := errors.New("token must in Bearer type: 'Bearer YOUR_TOKEN'")
				c.AbortWithError(http.StatusUnauthorized, err)
				return
			}
			tokenString := strings.TrimSpace(strings.SplitN(authHeader, "Bearer", 2)[1])
			accountId, err := utils.GetAccountIdField(tokenString)
			if err != nil {
				c.AbortWithError(http.StatusUnauthorized, err)
				return
			}
			tpAccountId, err := utils.GetTpAccountIdField(tokenString)
			if err != nil {
				c.AbortWithError(http.StatusUnauthorized, err)
				return
			}
			c.Set("accountId", accountId)
			c.Set("tpAccountId", tpAccountId)
			c.Set("tokenType", "tp")
			c.Next()
			return
		} else {
			c.Set("tokenType", "external")
			c.Set("accountId", config.Configs.App.AccountId)
			c.Next()
			return
		}
	}
}
