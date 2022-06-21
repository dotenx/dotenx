package oauthService

import (
	"context"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/stores/oauthStore"
	"github.com/dotenx/dotenx/ao-api/stores/redisStore"
)

type OauthService interface {
	GetRedisPairValue(key string) (exist bool, value string, err error)
	SetRedisPair(key, value string, ttl time.Duration) (err error)
	AddUserProvider(userProvider models.UserProvider) error
	DeleteUserProvider(accountId, userProviderName string) error
	GetUserProviderByName(accountId, name string) (models.UserProvider, error)
	GetUserProviderByTag(tag string) (models.UserProvider, error)
	UpdateUserProvider(userProvider models.UserProvider) error
	GetAllUserProviders(accountId string) ([]models.UserProvider, error)
}

type OauthManager struct {
	Store      oauthStore.OauthStore
	RedisStore redisStore.RedisStore
}

func NewOauthService(store oauthStore.OauthStore, redisStore redisStore.RedisStore) OauthService {
	return &OauthManager{
		Store:      store,
		RedisStore: redisStore,
	}
}

func (manager *OauthManager) GetRedisPairValue(key string) (exist bool, value string, err error) {
	return manager.RedisStore.GetRedisPairValue(key)
}

func (manager *OauthManager) SetRedisPair(key, value string, ttl time.Duration) (err error) {
	return manager.RedisStore.SetRedisPair(key, value, ttl)
}

func (manager *OauthManager) AddUserProvider(userProvider models.UserProvider) error {
	encryptedKey, err := utils.Encrypt(userProvider.Key, config.Configs.Secrets.Encryption)
	if err != nil {
		return err
	}
	encryptedSecret, err := utils.Encrypt(userProvider.Secret, config.Configs.Secrets.Encryption)
	if err != nil {
		return err
	}
	userProvider.Key = encryptedKey
	userProvider.Secret = encryptedSecret
	userProvider.Tag = utils.RandStringRunes(16, utils.FullRunes)
	return manager.Store.AddUserProvider(context.Background(), userProvider)
}

func (manager *OauthManager) DeleteUserProvider(accountId, userProviderName string) error {
	return manager.Store.DeleteUserProvider(context.Background(), accountId, userProviderName)
}

func (manager *OauthManager) GetUserProviderByName(accountId, name string) (models.UserProvider, error) {

	userProvider, err := manager.Store.GetUserProviderByName(context.Background(), accountId, name)
	if err != nil {
		return models.UserProvider{}, err
	}

	decryptedKey, err := utils.Decrypt(userProvider.Key, config.Configs.Secrets.Encryption)
	if err != nil {
		return models.UserProvider{}, err
	}
	decryptedSecret, err := utils.Decrypt(userProvider.Secret, config.Configs.Secrets.Encryption)
	if err != nil {
		return models.UserProvider{}, err
	}
	userProvider.Key = decryptedKey
	userProvider.Secret = decryptedSecret
	return userProvider, nil
}

func (manager *OauthManager) GetUserProviderByTag(tag string) (models.UserProvider, error) {
	userProvider, err := manager.Store.GetUserProviderByTag(context.Background(), tag)
	if err != nil {
		return models.UserProvider{}, err
	}

	decryptedKey, err := utils.Decrypt(userProvider.Key, config.Configs.Secrets.Encryption)
	if err != nil {
		return models.UserProvider{}, err
	}
	decryptedSecret, err := utils.Decrypt(userProvider.Secret, config.Configs.Secrets.Encryption)
	if err != nil {
		return models.UserProvider{}, err
	}
	userProvider.Key = decryptedKey
	userProvider.Secret = decryptedSecret
	return userProvider, nil
}

func (manager *OauthManager) UpdateUserProvider(userProvider models.UserProvider) error {
	encryptedKey, err := utils.Encrypt(userProvider.Key, config.Configs.Secrets.Encryption)
	if err != nil {
		return err
	}
	encryptedSecret, err := utils.Encrypt(userProvider.Secret, config.Configs.Secrets.Encryption)
	if err != nil {
		return err
	}
	userProvider.Key = encryptedKey
	userProvider.Secret = encryptedSecret
	return manager.Store.UpdateUserProvider(context.Background(), userProvider)
}

func (manager *OauthManager) GetAllUserProviders(accountId string) (providers []models.UserProvider, err error) {
	return manager.Store.GetAllUserProviders(context.Background(), accountId)
}
