package middlewares

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

type queryString struct {
	AccessToken string `form:"tp_access_token"`
}

func OauthMiddleware(httpHelper utils.HttpHelper) gin.HandlerFunc {
	return func(c *gin.Context) {
		dtxAuthHeader := c.Request.Header.Get("DTX-auth")
		if dtxAuthHeader != "" {
			adminUrl := config.Configs.Endpoints.Admin + "/auth/access/token/profile"
			headers := []utils.Header{
				{
					Key:   "Content-Type",
					Value: "application/json",
				},
			}
			var body = struct {
				AccessToken string `json:"accessToken"`
			}{
				AccessToken: dtxAuthHeader,
			}
			bodyBytes, _ := json.Marshal(body)
			resp, err, statusCode, _ := httpHelper.HttpRequest(http.MethodPost, adminUrl, bytes.NewBuffer(bodyBytes), headers, 0, false)
			if err != nil || statusCode != http.StatusOK {
				log.Println("statusCode:", statusCode)
				log.Println("err:", err)
				c.AbortWithStatus(http.StatusUnauthorized)
				return
			}
			type User struct {
				AccountId string `json:"accountId"`
			}
			userInfo := User{}
			err = json.Unmarshal(resp, &userInfo)
			if err != nil {
				log.Println("err:", err)
				c.AbortWithStatus(http.StatusUnauthorized)
				return
			}
			log.Println("Successfully authenticated: token type is external")
			log.Println("accountId:", userInfo.AccountId)
			c.Set("accountId", userInfo.AccountId)
			c.Set("tokenType", "external")
			c.Next()
			return
		} else {
			authHeader := c.Request.Header.Get("Authorization")
			var qs queryString
			if authHeader == "" {
				if c.ShouldBindQuery(&qs) != nil {
					err := errors.New("token must be in query parameter: your_url?tp_access_token=TOKEN")
					c.AbortWithError(http.StatusUnauthorized, err)
					return
				}
				log.Println("qs.AccessToken:", qs.AccessToken)
				authHeader = qs.AccessToken
			}
			if authHeader != "" {
				if qs.AccessToken != "" {
					authHeader = "Bearer " + qs.AccessToken
				}
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
				userGroup, err := utils.GetUserGroup(tokenString)
				if err != nil {
					c.AbortWithError(http.StatusUnauthorized, err)
					return
				}
				c.Set("accountId", accountId)
				c.Set("tpAccountId", tpAccountId)
				c.Set("userGroup", userGroup)
				c.Set("tokenType", "tp")
				c.Next()
				return
			} else {
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
						log.Println("error while saving session:", err.Error())
					}
					c.AbortWithStatus(http.StatusUnauthorized)
					return
				}
			}
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
