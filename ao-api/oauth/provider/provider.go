package provider

import (
	"fmt"
	"os"
	"strings"

	"github.com/dotenx/goth"
	"github.com/dotenx/goth/providers/amazon"
	"github.com/dotenx/goth/providers/battlenet"
	"github.com/dotenx/goth/providers/bitbucket"
	"github.com/dotenx/goth/providers/box"
	"github.com/dotenx/goth/providers/dailymotion"
	"github.com/dotenx/goth/providers/deezer"
	"github.com/dotenx/goth/providers/digitalocean"
	"github.com/dotenx/goth/providers/discord"
	"github.com/dotenx/goth/providers/dropbox"
	"github.com/dotenx/goth/providers/eveonline"
	"github.com/dotenx/goth/providers/facebook"
	"github.com/dotenx/goth/providers/fitbit"
	"github.com/dotenx/goth/providers/github"
	"github.com/dotenx/goth/providers/gitlab"
	"github.com/dotenx/goth/providers/google"
	"github.com/dotenx/goth/providers/heroku"
	"github.com/dotenx/goth/providers/influxcloud"
	"github.com/dotenx/goth/providers/instagram"
	"github.com/dotenx/goth/providers/intercom"
	"github.com/dotenx/goth/providers/lastfm"
	"github.com/dotenx/goth/providers/linkedin"
	"github.com/dotenx/goth/providers/meetup"
	"github.com/dotenx/goth/providers/microsoftonline"
	"github.com/dotenx/goth/providers/naver"
	"github.com/dotenx/goth/providers/onedrive"
	"github.com/dotenx/goth/providers/salesforce"
	"github.com/dotenx/goth/providers/slack"
	"github.com/dotenx/goth/providers/soundcloud"
	"github.com/dotenx/goth/providers/spotify"
	"github.com/dotenx/goth/providers/stripe"
	"github.com/dotenx/goth/providers/twitch"
	"github.com/dotenx/goth/providers/twitter"
	"github.com/dotenx/goth/providers/uber"
	"github.com/dotenx/goth/providers/vk"
	"github.com/dotenx/goth/providers/wepay"
	"github.com/dotenx/goth/providers/xero"
	"github.com/dotenx/goth/providers/yahoo"
	"github.com/dotenx/goth/providers/yammer"
)

// ProviderNameInitializationMap is a map of initialization functions for supported OAUTH providers
var ProviderNameInitializationMap = make(map[string]func(key, secret, cbUrl string, scopes ...string) goth.Provider)

func init() {
	ProviderNameInitializationMap["amazon"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := amazon.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["battlenet"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := battlenet.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["bitbucket"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := bitbucket.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["box"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := box.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["dailymotion"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := dailymotion.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["deezer"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := deezer.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["digitalocean"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := digitalocean.New(key, secret, cbUrl, scopes...)
		return provider
	}

	ProviderNameInitializationMap["discord"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := discord.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["dropbox"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := dropbox.New(key, secret, cbUrl, scopes...)
		return provider
	}
	// ............................Added by Hojjat............................
	// just a trick to fill ebay provider
	// we use goth package as oauth handler this package han't some oauth providers so we need this trick to maintain our code base
	ProviderNameInitializationMap["ebay"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := google.New(key, secret, cbUrl, scopes...)
		return provider
	}
	// ............................Added by Hojjat............................
	ProviderNameInitializationMap["eveonline"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := eveonline.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["facebook"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := facebook.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["fitbit"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := fitbit.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["github"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := github.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["gitlab"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := gitlab.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["google"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := google.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["heroku"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := heroku.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["influxcloud"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := influxcloud.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["instagram"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := instagram.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["intercom"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := intercom.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["lastfm"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := lastfm.New(key, secret, cbUrl)
		return provider
	}
	ProviderNameInitializationMap["linkedin"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := linkedin.New(key, secret, cbUrl, scopes...)
		return provider
	}
	// ............................Added by Hojjat............................
	// just a trick to fill mailchimp provider
	// we use goth package as oauth handler this package han't some oauth providers so we need this trick to maintain our code base
	ProviderNameInitializationMap["mailchimp"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := google.New(key, secret, cbUrl, scopes...)
		return provider
	}
	// ............................Added by Hojjat............................
	ProviderNameInitializationMap["meetup"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := meetup.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["microsoftonline"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := microsoftonline.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["naver"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := naver.New(key, secret, cbUrl)
		return provider
	}
	ProviderNameInitializationMap["onedrive"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := onedrive.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["salesforce"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := salesforce.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["slack"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := slack.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["soundcloud"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := soundcloud.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["spotify"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := spotify.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["stripe"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := stripe.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["twitch"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := twitch.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["twitter"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := twitter.New(key, secret, cbUrl)
		return provider
	}
	ProviderNameInitializationMap["uber"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := uber.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["vk"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := vk.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["wepay"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := wepay.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["xero"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := xero.New(key, secret, cbUrl)
		return provider
	}
	ProviderNameInitializationMap["yahoo"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := yahoo.New(key, secret, cbUrl, scopes...)
		return provider
	}
	ProviderNameInitializationMap["yammer"] = func(key, secret, cbUrl string, scopes ...string) goth.Provider {
		provider := yammer.New(key, secret, cbUrl, scopes...)
		return provider
	}
}

// New returns a new provider with the given parameters. It checks if the provider is supported or not and if all the requierements are met.
func New(name string, secret, key *string, uri string, scopes ...string) (*goth.Provider, error) {
	var initfunction func(key, secret, cbUrl string, scopes ...string) goth.Provider
	if val, ok := ProviderNameInitializationMap[name]; !ok {
		return nil, fmt.Errorf("No such OAUTH provider %v", name)
	} else {
		initfunction = val
	}

	if uri == "" {
		return nil, fmt.Errorf("Invalid callback uri provided for OAUTH provider %v", name)
	}

	capped := strings.ToUpper(name)
	// check if secret is present, if not check for ENV var
	if secret == nil || *secret == "" {
		envVar := fmt.Sprintf("%v_SECRET", capped)
		envVarValue := os.Getenv(envVar)
		if envVarValue == "" {
			return nil, fmt.Errorf("No secret set for %v OAUTH provider in config and environment variable %v not set, cannot set up OAUTH for %v", name, envVar, name)
		}
		secret = &envVarValue
	}

	// check if key is present, if not check for ENV var
	if key == nil || *key == "" {
		envVar := fmt.Sprintf("%v_KEY", capped)
		envVarValue := os.Getenv(envVar)
		if envVarValue == "" {
			return nil, fmt.Errorf("No key set for %v OAUTH provider in config and environment variable %v not set, cannot set up OAUTH for %v", name, envVar, name)
		}
		key = &envVarValue
	}

	gothProvider := initfunction(*key, *secret, uri, scopes...)

	return &gothProvider, nil
}
