package models

type OauthProvider struct {
	Name   string   `json:"name"`
	Secret string   `json:"secret,omitempty"`
	Key    string   `json:"key,omitempty"`
	Scopes []string `json:"scopes,omitempty"`
}
