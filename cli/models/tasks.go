package models

type TaskDefinition struct {
	Service             string `json:"service" yaml:"service"`
	Type                string
	Fields              []TaskField
	Image               string      `json:"image" yaml:"image"`
	Integrations        []string    `json:"integrations" yaml:"integrations"`
	Author              string      `json:"author" yaml:"author"`
	Icon                string      `json:"icon" yaml:"icon"`
	NodeColor           string      `json:"node_color" yaml:"node_color"`
	Description         string      `json:"description" yaml:"description"`
	Outputs             []TaskField `json:"outputs" yaml:"outputs"`
	HasDynamicVariables bool        `json:"has_dynamic_variables" yaml:"has_dynamic_variables"`
}

type TaskField struct {
	Key         string `json:"key" yaml:"key"`
	Type        string `json:"type" yaml:"type"`
	Description string `json:"description" yaml:"description"`
	DisplayName string `json:"display_name" yaml:"display_name"`
}
