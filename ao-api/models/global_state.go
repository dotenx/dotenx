package models

type GlobalState struct {
	AccountId   string   `json:"account_id"   db:"account_id"`
	ProjectName string   `json:"project_name" db:"project_name"`
	States      []string `json:"states"       db:"states"`
}
