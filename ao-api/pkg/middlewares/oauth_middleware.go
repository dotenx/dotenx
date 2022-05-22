package middlewares

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func OauthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		session := sessions.Default(c)
		fmt.Println("expTime:", session.Get("expirationTime"))
		expTime, ok := session.Get("expirationTime").(int64)
		if ok && expTime > time.Now().Unix() {
			accountId := session.Get("accountId").(string)
			fmt.Println("Successfully authenticated: token type is external")
			c.Set("accountId", accountId)
			c.Set("tokenType", "external")
			c.Next()
			return
		} else {
			session.Clear()
			err := session.Save()
			if err != nil {
				log.Println(err.Error())
				// c.AbortWithError(http.StatusInternalServerError, err)
				// return
			}
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
	}
}

func Internal() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.Request.Header.Get("Authorization")
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
