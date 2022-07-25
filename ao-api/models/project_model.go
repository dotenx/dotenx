package models

type Project struct {
	Id               int    `db:"id" json:"-"`
	Name             string `db:"name" json:"name" binding:"regexp=^[a-z][a-z0-9_]*$,min=2,max=20"`
	Description      string `db:"description" json:"description"`
	AccountId        string `db:"account_id" json:"-"`
	Tag              string `db:"tag" json:"tag"`
	DefaultUserGroup string `json:"default_user_group"`
}
