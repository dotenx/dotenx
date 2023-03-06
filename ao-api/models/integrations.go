package models

type IntegrationDefinition struct {
	Type          string              `json:"type" yaml:"type"`
	Secrets       []IntegrationSecret `json:"secrets" yaml:"secrets"`
	OauthProvider string              `json:"oauth_provider" yaml:"oauth_provider"`
}

type IntegrationSecret struct {
	Name     string `json:"name" yaml:"name"`
	Key      string `json:"key" yaml:"key"`
	Internal bool   `json:"internal" yaml:"internal"`
}

type Integration struct {
	Name            string            `db:"name" json:"name"`
	AccountId       string            `db:"account_id" json:"account_id"`
	Type            string            `db:"type" json:"type"`
	Secrets         map[string]string `db:"secrets" json:"secrets"`
	HasRefreshToken bool              `db:"hasRefreshToken" json:"hasRefreshToken"`
	Provider        string            `db:"provider" json:"provider"`
	TpAccountId     string            `db:"tp_account_id" json:"tp_account_id"`
	ProjectName     string            `db:"project_name" json:"project_name"`
}

func (intg Integration) IsValid() bool {
	for integrationType, _ := range AvaliableIntegrations {
		if integrationType == intg.Type {
			return true
		}
	}
	return false
}
