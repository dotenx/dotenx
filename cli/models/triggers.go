package models

type TriggerDefinition struct {
	Service          string       `json:"service" yaml:"service"`
	Type             string       `json:"type" yaml:"type"`
	IntegrationTypes []string     `json:"integrations" yaml:"integrations"`
	Image            string       `json:"image" yaml:"image"`
	Credentials      []Credential `json:"credentials" yaml:"credentials"`
	Outputs          []Credential `json:"outputs" yaml:"outputs"`
	Author           string       `json:"author" yaml:"author"`
	Icon             string       `json:"icon" yaml:"icon"`
	NodeColor        string       `json:"node_color" yaml:"node_color"`
	Description      string       `json:"description" yaml:"description"`
}

type Credential struct {
	Key         string `json:"key" yaml:"key"`
	Type        string `json:"type" yaml:"type"`
	Description string `json:"description" yaml:"description"`
	DisplayName string `json:"display_name" yaml:"display_name"`
}
