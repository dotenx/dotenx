package oauth

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/oauth/provider"
	"github.com/markbates/goth"
)

var providers []models.OauthProvider

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
func GetProviders(cbURIBase string) ([]*goth.Provider, error) {
	result := make([]*goth.Provider, 0)
	if providers == nil {
		return result, nil
	}
	for _, v := range providers {
		uri := cbURIBase + v.Name
		p, err := provider.New(v.Name, &v.Secret, &v.Key, uri, v.Scopes...)
		if err != nil {
			return result, err
		}
		result = append(result, p)
	}
	return result, nil
}
