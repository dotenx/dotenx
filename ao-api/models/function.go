package models

type Function struct {
	Name           string `json:"name"             db:"name"`
	AccountId      string `json:"accountId"        db:"account_id"`
	Enabled        bool   `json:"enabled"          db:"enabled"`
	DefinitionFile string `json:"definitionFile"   db:"definition_file"`
	Type           string `json:"type"             db:"type"`
}
