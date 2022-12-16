package models

import (
	"encoding/json"
)

type UIPage struct {
	Name       string          `json:"name" db:"name"`
	AccountId  string          `db:"account_id" json:"-"`
	ProjectTag string          `db:"project_tag" json:"project_tag"`
	Content    json.RawMessage `db:"content" json:"content"`
	Status     string          `db:"status" json:"status"`
}

type UIComponent struct {
	Name       string          `json:"name" db:"name"`
	AccountId  string          `db:"account_id" json:"-"`
	ProjectTag string          `db:"project_tag" json:"project_tag"`
	Content    json.RawMessage `db:"content" json:"content"`
	Status     string          `db:"status" json:"status"`
	Category   string          `db:"category" json:"category"`
}
