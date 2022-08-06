package oauthController

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *OauthController) OAuthVerifyWebhook(c *gin.Context) {
	provider := c.Param("provider")
	if provider == "ebay" {
		code := c.Query("challenge_code")
		token := config.Configs.Secrets.EbayNotifToken
		endpoint := config.Configs.Endpoints.AoApiLocal + "/oauth/webhook/ebay"
		fmt.Println("code:", code)
		hasher := sha256.New()
		hasher.Write([]byte(code + token + endpoint))
		sha256Hash := hex.EncodeToString(hasher.Sum(nil))
		fmt.Println("challengeResponse:", sha256Hash)
		c.JSON(200, gin.H{
			"challengeResponse": sha256Hash,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "ok",
	})
}

func (controller *OauthController) OAuthWebhook(c *gin.Context) {
	body, _ := ioutil.ReadAll(c.Request.Body)
	logrus.Info(string(body))
	c.JSON(http.StatusOK, gin.H{
		"message": "ok",
	})
}
