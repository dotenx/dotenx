package models

type OauthProvider struct {
	Name      string   `json:"name"`
	Secret    string   `json:"secret,omitempty"`
	Key       string   `json:"key,omitempty"`
	DirectUrl string   `json:"direct_url"`
	Scopes    []string `json:"scopes,omitempty"`
}
