package oauth

import (
	"github.com/markbates/goth"
	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/oauth/provider"
)

// GetProviders returns a slice of providers formed from the corresponding config section
func GetProviders(providers *[]models.OauthProvider, cbURIBase string) ([]*goth.Provider, error) {
	result := make([]*goth.Provider, 0)
	if providers == nil {
		return result, nil
	}
	for _, v := range *providers {
		uri := cbURIBase + v.Name
		p, err := provider.New(v.Name, v.Secret, v.Key, uri)
		if err != nil {
			return result, err
		}
		result = append(result, p)
	}
	return result, nil
}
