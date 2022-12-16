package models

type Objectstore struct {
	Key         string   `db:"key" json:"key"`
	AccountId   string   `db:"account_id" json:"-"`
	TpAccountId string   `db:"tpaccount_id" json:"tpaccount_id"`
	ProjectTag  string   `db:"project_tag" json:"project_tag"`
	Size        int      `db:"size" json:"size"`
	Access      string   `db:"access" json:"access"`
	Url         string   `db:"url" json:"url"`
	IsPublic    bool     `db:"is_public" json:"is_public"`
	UserGroups  []string `db:"user_groups" json:"user_groups"`
}
