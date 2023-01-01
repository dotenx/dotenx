package models

import "encoding/json"

type GitIntegration struct {
	AccountId       string          `db:"account_id"        json:"account_id,omitempty"`
	GitAccountId    string          `db:"git_account_id"    json:"git_account_id,omitempty"`
	GitUsername     string          `db:"git_username"      json:"git_username"`
	Provider        string          `db:"provider"          json:"provider,omitempty"`
	Secrets         json.RawMessage `db:"secrets"           json:"-"`
	HasRefreshToken bool            `db:"has_refresh_token" json:"-"`
}
