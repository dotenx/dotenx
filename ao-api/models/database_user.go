package models

type DatabaseUser struct {
	AccountId   string `json:"account_id"   db:"account_id"`
	ProjectName string `json:"project_name" db:"project_name"`
	Username    string `json:"username"     db:"username"`
	Password    string `json:"password"     db:"password"`
}
