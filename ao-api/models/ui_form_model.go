package models

import "encoding/json"

type UIForm struct {
	Name       string          `db:"name"        json:"name,omitempty"`
	ProjectTag string          `db:"project_tag" json:"project_tag,omitempty"`
	PageName   string          `db:"page_name"   json:"page_name,omitempty"`
	FormId     string          `db:"form_id"     json:"form_id,omitempty"`
	Response   json.RawMessage `db:"response"    json:"response,omitempty"`
}
