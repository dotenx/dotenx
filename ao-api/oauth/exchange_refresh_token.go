package oauth

import (
	"errors"
	"log"
	"time"

	"github.com/dotenx/dotenx/ao-api/stores/redisStore"
	"github.com/dotenx/goth"
)

func ExchangeRefreshToken(provider goth.Provider, integrationName, accountID string, redisStore redisStore.RedisStore) (accessToekn string, err error) {
	if !provider.RefreshTokenAvailable() {
		return "", errors.New("this provider doesn't support refresh token")
	}
	redisAccessTokenKey := "ao-api|" + accountID + "|" + integrationName + "|access_token"
	redisRefreshTokenKey := "ao-api|" + accountID + "|" + integrationName + "|refresh_token"
	exist, oldRefreshToken, redisErr := redisStore.GetRedisPairValue(redisRefreshTokenKey)
	if !exist || oldRefreshToken == "" || redisErr != nil {
		return "", errors.New("Failed to get refresh token from redis")
	}

	success := false
	for i := 0; i < 20; i++ {
		exist, oldAccessToken, redisErr := redisStore.GetRedisPairValue(redisAccessTokenKey)
		if redisErr != nil {
			return "", redisErr
		}
		if exist && oldAccessToken != "" && oldAccessToken != "pending" {
			log.Println("access token already exist")
			log.Println("oldAccessToken:", oldAccessToken)
			accessToekn = oldAccessToken
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
				return "", redisErr
			}
			exist, oldRefreshToken, redisErr := redisStore.GetRedisPairValue(redisRefreshTokenKey)
			if !exist || oldRefreshToken == "" || redisErr != nil {
				return "", errors.New("Failed to get refresh token from redis")
			}
			newToken, err := provider.RefreshToken(oldRefreshToken)
			if err != nil {
				return "", err
			}

			expIn := newToken.Expiry.Sub(time.Now()).Seconds()
			newAccessToken := newToken.AccessToken
			newRefreshToken := newToken.RefreshToken
			redisErr = redisStore.SetRedisPair(redisAccessTokenKey, newAccessToken, time.Duration(expIn*float64(time.Second)))
			if redisErr != nil {
				return "", redisErr
			}
			if newRefreshToken != "" {
				redisErr = redisStore.SetRedisPair(redisRefreshTokenKey, newRefreshToken, 0)
				if redisErr != nil {
					return "", redisErr
				}
			}
			accessToekn = newAccessToken
			success = true
			break
		}

	}
	if !success {
		return "", errors.New("failed in process of get/update oauth tokens")
	}
	return
}
