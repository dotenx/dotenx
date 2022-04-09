package redisStore

import (
	"time"

	"github.com/go-redis/redis"
)

type RedisStore interface {
	// GetRedisPairValue checks that a value exist for key and if exist returnes value of it
	GetRedisPairValue(key string) (exist bool, value string, err error)
	// SetRedisPair sets a key-value pair with time-to-live in redis (zero ttl means the key has no expiration time)
	SetRedisPair(key, value string, ttl time.Duration) (err error)
}

type redisStore struct {
	redisClient *redis.Client
}

func New(redisClient *redis.Client) RedisStore {
	return &redisStore{redisClient: redisClient}
}

func (store *redisStore) GetRedisPairValue(key string) (exist bool, value string, err error) {
	rdb := store.redisClient
	value, err = rdb.Get(key).Result()
	if err != nil && err != redis.Nil {
		return
	}
	if err != nil && err == redis.Nil {
		err = nil
		exist = false
		return
	}
	exist = true
	return
}

// Set a key-value pair with time-to-live in redis
// zero ttl means the key has no expiration time
func (store *redisStore) SetRedisPair(key, value string, ttl time.Duration) (err error) {
	err = store.redisClient.Set(key, value, ttl).Err()
	return
}
