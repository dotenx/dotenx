package models

type IntegrationFile struct {
	Type             string `yaml:"type"`
	NeedsAccessToken bool   `yaml:"needs_access_token"`
	NeedsKey         bool   `yaml:"needs_key"`
	NeedsSecret      bool   `yaml:"needs_secret"`
	NeedsUrl         bool   `yaml:"needs_url"`
}

type Integration struct {
	Name        string `db:"name" json:"name"`
	AccountId   string `db:"account_id" json:"account_id"`
	Type        string `db:"type" json:"type"`
	Url         string `db:"url" json:"url"`
	Key         string `db:"key" json:"key"`
	Secret      string `db:"secret" json:"secret"`
	AccessToken string `db:"access_token" json:"access_token"`
}

func (intg Integration) IsValid() bool {
	for integrationType, _ := range AvaliableIntegrations {
		if integrationType == intg.Type {
			return true
		}
	}
	return false
}

type IntegrationDefinition struct {
	Type   string   `json:"type"`
	Fields []string `json:"fields"`
}

type IntegrationField struct {
	Key  string `json:"key"`
	Type string `json:"type"`
}
