package oauthService

import (
	"time"

	"github.com/dotenx/dotenx/ao-api/stores/redisStore"
)

type OauthService interface {
	GetRedisPairValue(key string) (exist bool, value string, err error)
	SetRedisPair(key, value string, ttl time.Duration) (err error)
}

type OauthManager struct {
	RedisStore redisStore.RedisStore
}

func NewOauthService(store redisStore.RedisStore) OauthService {
	return &OauthManager{RedisStore: store}
}

func (manager *OauthManager) GetRedisPairValue(key string) (exist bool, value string, err error) {
	return manager.RedisStore.GetRedisPairValue(key)
}

func (manager *OauthManager) SetRedisPair(key, value string, ttl time.Duration) (err error) {
	return manager.RedisStore.SetRedisPair(key, value, ttl)
}
