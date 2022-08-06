package oauth

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/stores/redisStore"
	"github.com/dotenx/goth"
	"golang.org/x/oauth2"
)

// ExchangeRefreshToken tries to get access and refresh tokens from redis (this method needs refresh token when access token expired)
func ExchangeRefreshToken(gProvider goth.Provider, oauthProvider models.OauthProvider, integrationName, accountID string, redisStore redisStore.RedisStore) (accessToekn, refreshToken string, err error) {
	if !gProvider.RefreshTokenAvailable() {
		return "", "", errors.New("this provider doesn't support refresh token")
	}
	redisAccessTokenKey := "ao-api|" + accountID + "|" + integrationName + "|access_token"
	redisRefreshTokenKey := "ao-api|" + accountID + "|" + integrationName + "|refresh_token"
	exist, oldRefreshToken, redisErr := redisStore.GetRedisPairValue(redisRefreshTokenKey)
	if !exist || oldRefreshToken == "" || redisErr != nil {
		return "", "", errors.New("Failed to get refresh token from redis")
	}

	success := false
	for i := 0; i < 20; i++ {
		exist, oldAccessToken, redisErr := redisStore.GetRedisPairValue(redisAccessTokenKey)
		if redisErr != nil {
			return "", "", redisErr
		}
		if exist && oldAccessToken != "" && oldAccessToken != "pending" {
			log.Println("access token already exist")
			log.Println("oldAccessToken:", oldAccessToken)
			accessToekn = oldAccessToken
			refreshToken = oldRefreshToken
			success = true
			break
		}
		if oldAccessToken == "pending" {
			log.Println("wait until updating of refresh token end")
			time.Sleep(500 * time.Millisecond)
			continue
		}
		if !exist {
			redisErr := redisStore.SetRedisPair(redisAccessTokenKey, "pending", 30*time.Second)
			log.Println("trying to update refresh token")
			if redisErr != nil {
				return "", "", redisErr
			}
			exist, oldRefreshToken, redisErr := redisStore.GetRedisPairValue(redisRefreshTokenKey)
			if !exist || oldRefreshToken == "" || redisErr != nil {
				return "", "", errors.New("Failed to get refresh token from redis")
			}
			var newToken *oauth2.Token
			var expIn float64
			if utils.ContainsString(utils.SpecialProviders, oauthProvider.Name) {
				newToken = &oauth2.Token{}
				var accessToken, refreshToken string
				var expInInt int
				var err error
				switch oauthProvider.Name {
				case "ebay":
					directUrl, parseErr := url.Parse(oauthProvider.DirectUrl)
					if parseErr != nil {
						return "", "", err
					}
					qParams, parseErr := url.ParseQuery(directUrl.RawQuery)
					if parseErr != nil {
						return "", "", err
					}
					accessToken, expInInt, err = ebayRefreshToekn(oauthProvider.Key, oauthProvider.Secret, oldRefreshToken, url.QueryEscape(qParams.Get("scope")))
				}
				if err != nil {
					return "", "", err
				}
				expIn = float64(expInInt)
				newToken.AccessToken = accessToken
				newToken.RefreshToken = refreshToken
			} else {
				newToken, err = gProvider.RefreshToken(oldRefreshToken)
				if err != nil {
					return "", "", err
				}
				expIn = newToken.Expiry.Sub(time.Now()).Seconds()
			}

			newAccessToken := newToken.AccessToken
			newRefreshToken := newToken.RefreshToken
			redisErr = redisStore.SetRedisPair(redisAccessTokenKey, newAccessToken, time.Duration(expIn*float64(time.Second)))
			if redisErr != nil {
				return "", "", redisErr
			}
			if newRefreshToken != "" {
				redisErr = redisStore.SetRedisPair(redisRefreshTokenKey, newRefreshToken, 0)
				if redisErr != nil {
					return "", "", redisErr
				}
				refreshToken = newRefreshToken
			} else {
				refreshToken = oldRefreshToken
			}
			accessToekn = newAccessToken
			success = true
			break
		}

	}
	if !success {
		return "", "", errors.New("failed in process of get/update oauth tokens")
	}
	return
}

func ebayRefreshToekn(clientId, clientSecret, refreshToken, scopes string) (accessToekn string, expIn int, err error) {
	var dto struct {
		AccessToekn string `json:"access_token"`
		ExpiresIn   int    `json:"expires_in"`
	}
	data := "refresh_token=" + refreshToken
	data += "&grant_type=refresh_token"
	data += "&scope=" + scopes
	url := "https://api.ebay.com/identity/v1/oauth2/token"
	headers := []utils.Header{
		{
			Key:   "Content-Type",
			Value: "application/x-www-form-urlencoded",
		},
		{
			Key:   "Authorization",
			Value: "Basic " + base64.StdEncoding.EncodeToString([]byte(clientId+":"+clientSecret)),
		},
	}
	body := bytes.NewBuffer([]byte(data))
	helper := utils.NewHttpHelper(utils.NewHttpClient())
	out, err, status, _ := helper.HttpRequest(http.MethodPost, url, body, headers, time.Minute, true)
	log.Println("ebay response:", string(out))
	log.Println("-----------------------------------------------------------")
	if err != nil {
		return "", 0, err
	}
	if status != http.StatusOK {
		return "", 0, errors.New("not ok with status " + fmt.Sprint(status))
	}
	err = json.Unmarshal(out, &dto)
	return dto.AccessToekn, dto.ExpiresIn, err
}
