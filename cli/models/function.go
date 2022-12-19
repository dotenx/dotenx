package models

type Function struct {
	Name           string `json:"name"`
	AccountId      string `json:"accountId"`
	Enabled        bool   `json:"enabled"`
	DefinitionFile string `json:"definitionFile"`
	Type           string `json:"type"`
}
