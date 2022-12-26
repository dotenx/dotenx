package models

import (
	"encoding/json"
	"time"
)

type UIPage struct {
	Name                   string          `json:"name" db:"name"`
	AccountId              string          `db:"account_id" json:"-"`
	ProjectTag             string          `db:"project_tag" json:"project_tag"`
	Content                json.RawMessage `db:"content" json:"content"`
	Status                 string          `db:"status" json:"status"`
	LastPublishedAt        time.Time       `db:"last_published_at" json:"last_published_at"`
	LastPreviewPublishedAt time.Time       `db:"last_preview_published_at" json:"last_preview_published_at"`
}

type UIComponent struct {
	Name       string          `json:"name" db:"name"`
	AccountId  string          `db:"account_id" json:"-"`
	ProjectTag string          `db:"project_tag" json:"project_tag"`
	Content    json.RawMessage `db:"content" json:"content"`
	Status     string          `db:"status" json:"status"`
	Category   string          `db:"category" json:"category"`
}

type UIExtension struct {
	Name       string          `db:"name"        json:"name"`
	AccountId  string          `db:"account_id"  json:"-"`
	ProjectTag string          `db:"project_tag" json:"project_tag"`
	Content    json.RawMessage `db:"content"     json:"content"`
	Status     string          `db:"status"      json:"status"`
	Category   string          `db:"category"    json:"category"`
}
