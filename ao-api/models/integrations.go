package models

type IntegrationDefinition struct {
	Type          string   `json:"type" yaml:"type"`
	Secrets       []string `json:"secrets" yaml:"secrets"`
	OauthProvider string   `json:"oauth_provider" yaml:"oauth_provider"`
}

type Integration struct {
	Name            string            `db:"name" json:"name"`
	AccountId       string            `db:"account_id" json:"account_id"`
	Type            string            `db:"type" json:"type"`
	Secrets         map[string]string `db:"secrets" json:"secrets"`
	HasRefreshToken bool              `db:"hasRefreshToken" json:"hasRefreshToken"`
}

func (intg Integration) IsValid() bool {
	for integrationType, _ := range AvaliableIntegrations {
		if integrationType == intg.Type {
			return true
		}
	}
	return false
}
