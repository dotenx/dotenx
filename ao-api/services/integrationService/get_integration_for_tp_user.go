package integrationService

import (
	"context"
	"fmt"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/oauth"
	"github.com/dotenx/dotenx/ao-api/oauth/provider"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/goth"
)

func (manager *IntegrationManager) GetIntegrationForThirdPartyAccount(accountId, tpAccountId, integType string) (models.Integration, error) {

	integration, err := manager.Store.GetIntegrationForThirdPartyUser(context.Background(), accountId, tpAccountId, integType)
	if err != nil {
		return models.Integration{}, err
	}
	if !integration.HasRefreshToken {
		for key, value := range integration.Secrets {
			decrypted, err := utils.Decrypt(value, config.Configs.Secrets.Encryption)
			if err != nil {
				return models.Integration{}, err
			}
			integration.Secrets[key] = decrypted
		}
		return integration, err
	} else {
		var gothProvider *goth.Provider
		var oauthProvider = models.OauthProvider{}
		if integration.Provider == "" {
			providerName := models.AvaliableIntegrations[integration.Type].OauthProvider
			providers := oauth.GetProvidersMap()
			oauthProvider = providers[providerName]
			gothProvider, err = oauth.GetProviderByName(providerName)
			if err != nil {
				return models.Integration{}, err
			}
		} else {
			userProvider, err := manager.OauthStore.GetUserProviderByName(context.Background(), accountId, integration.Provider)
			if err != nil {
				return models.Integration{}, err
			}
			decryptedKey, err := utils.Decrypt(userProvider.Key, config.Configs.Secrets.Encryption)
			if err != nil {
				return models.Integration{}, err
			}
			decryptedSecret, err := utils.Decrypt(userProvider.Secret, config.Configs.Secrets.Encryption)
			if err != nil {
				return models.Integration{}, err
			}
			userProvider.Key = decryptedKey
			userProvider.Secret = decryptedSecret
			oauthProvider.Name = userProvider.Type
			oauthProvider.Key = decryptedKey
			oauthProvider.Secret = decryptedSecret
			oauthProvider.DirectUrl = userProvider.DirectUrl
			redirectUrl := config.Configs.Endpoints.AoApiLocal + fmt.Sprintf("/oauth/user/provider/integration/callbacks/provider/%s/account_id/%s", integration.Provider, accountId)
			gothProvider, err = provider.New(userProvider.Type, &userProvider.Secret, &userProvider.Key, redirectUrl, userProvider.Scopes...)
			if err != nil {
				return models.Integration{}, err
			}
		}

		accessToken, refreshToken, err := oauth.ExchangeRefreshToken(*gothProvider, oauthProvider, integration.Name, accountId, manager.RedisStore)
		if err != nil {
			return models.Integration{}, err
		}
		return models.Integration{
			Name:      integration.Name,
			AccountId: accountId,
			Type:      integration.Type,
			Secrets: map[string]string{
				"ACCESS_TOKEN":  accessToken,
				"REFRESH_TOKEN": refreshToken,
			},
			HasRefreshToken: integration.HasRefreshToken,
		}, nil
	}
}
