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

	AddToRedisSortedSet(key string, value []interface{}) (err error)
	GetRedisSortedSet(key string) (exist bool, value []string, err error)
	RemoveFromRedisSortedSet(key string, value []interface{}) (err error)
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

func (store *redisStore) AddToRedisSortedSet(key string, value []interface{}) (err error) {
	if len(value) == 0 {
		return nil
	}
	rzSlice := make([]redis.Z, 0)
	for _, v := range value {
		rzSlice = append(rzSlice, redis.Z{
			Score:  0,
			Member: v,
		})
	}
	err = store.redisClient.ZAdd(key, rzSlice...).Err()
	return
}

func (store *redisStore) GetRedisSortedSet(key string) (exist bool, value []string, err error) {
	rdb := store.redisClient
	value, err = rdb.ZRange(key, 0, -1).Result()
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

func (store *redisStore) RemoveFromRedisSortedSet(key string, value []interface{}) (err error) {
	if len(value) == 0 {
		return nil
	}
	err = store.redisClient.ZRem(key, value...).Err()
	return
}
