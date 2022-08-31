package middlewares

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func InternalMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.Request.Header.Get("DTX-auth-internal")
		if authHeader != "" {
			if len(strings.SplitN(authHeader, "Bearer", 2)) != 2 {
				err := errors.New("token must in Bearer type")
				c.AbortWithError(http.StatusUnauthorized, err)
				return
			}
			tokenString := strings.TrimSpace(strings.SplitN(authHeader, "Bearer", 2)[1])
			authorized, err := utils.GetAuthorizedField(tokenString)
			if !authorized || err != nil {
				if err == nil {
					err = errors.New("not authorized")
				}
				log.Println(err.Error())
				c.AbortWithError(http.StatusUnauthorized, err)
				return
			}
			fmt.Println("Successfully authenticated: token type is internal")
			c.Set("tokenType", "internal")
			c.Next()
			return
		} else {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
	}
}
