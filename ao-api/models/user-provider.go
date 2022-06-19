package models

import "github.com/lib/pq"

type UserProvider struct {
	Name        string         `db:"name"          json:"name"`
	Type        string         `db:"type"          json:"type"`
	Key         string         `db:"key"           json:"key,omitempty"`
	Secret      string         `db:"secret"        json:"secret,omitempty"`
	DirectUrl   string         `db:"direct_url"    json:"direct_url"`
	Scopes      pq.StringArray `db:"scopes"        json:"scopes"`
	AccountId   string         `db:"account_id"    json:"account_id"`
	FrontEndUrl string         `db:"front_end_url" json:"front_end_url"`
	Tag         string         `db:"tag"           json:"tag"`
}
