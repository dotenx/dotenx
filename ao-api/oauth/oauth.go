package oauth

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/oauth/provider"
	"github.com/dotenx/goth"
)

var providers []models.OauthProvider
var gothProviders map[string]*goth.Provider

func init() {
	jsonFile, err := os.Open("providers.json")
	if err != nil {
		fmt.Println(err)
	}
	defer jsonFile.Close()
	byteValue, _ := ioutil.ReadAll(jsonFile)
	err = json.Unmarshal(byteValue, &providers)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println("############")
	fmt.Println(providers)
	fmt.Println("############")
}

// GetProviders returns a slice of providers formed from the corresponding config section
func GetProviders(cbURIBase string) (map[string]*goth.Provider, error) {
	gothProviders = make(map[string]*goth.Provider)
	if providers == nil {
		return gothProviders, nil
	}
	for _, v := range providers {
		uri := cbURIBase + v.Name
		p, err := provider.New(v.Name, &v.Secret, &v.Key, uri, v.Scopes...)
		if err != nil {
			return gothProviders, err
		}
		gothProviders[v.Name] = p
	}
	return gothProviders, nil
}

func GetProviderByName(name string) (*goth.Provider, error) {
	p, ok := gothProviders[name]
	if !ok {
		return nil, errors.New("Provider not found")
	}
	return p, nil
}

func GetProviderModelByName(name string) (*models.OauthProvider, error) {
	for _, v := range providers {
		if v.Name == name {
			return &v, nil
		}
	}
	return nil, errors.New("provider not found")
}

func GetProvidersMap() map[string]models.OauthProvider {
	res := make(map[string]models.OauthProvider)
	for _, p := range providers {
		res[p.Name] = p
	}
	return res
}
