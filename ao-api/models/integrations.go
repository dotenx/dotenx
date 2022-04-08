package models

type IntegrationDefinition struct {
	Type    string   `yaml:"type"`
	Secrets []string `yaml:"secrets"`
}

type Integration struct {
	Name      string            `db:"name" json:"name"`
	AccountId string            `db:"account_id" json:"account_id"`
	Type      string            `db:"type" json:"type"`
	Secrets   map[string]string `db:"secrets" json:"secrets"`
}

func (intg Integration) IsValid() bool {
	for integrationType, _ := range AvaliableIntegrations {
		if integrationType == intg.Type {
			return true
		}
	}
	return false
}
