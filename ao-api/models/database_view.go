package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

type ViewJsonObject map[string]interface{}

func (t ViewJsonObject) Value() (driver.Value, error) {
	return json.Marshal(t)
}

func (t *ViewJsonObject) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion .([]byte) failed")
	}

	var i interface{}
	err := json.Unmarshal(b, &i)
	if err != nil {
		return err
	}

	*t, ok = i.(map[string]interface{})
	if !ok {
		return errors.New("type assertion .(map[string]interface{}) failed")
	}

	return nil
}

type DatabaseView struct {
	Name      string         `db:"name"           json:"name"`
	Query     string         `db:"query"          json:"query,omitempty"`
	JsonQuery ViewJsonObject `db:"query_as_json"  json:"query_as_json,omitempty"`
	Values    ViewJsonObject `db:"values"         json:"values,omitempty"`
	IsPublic  bool           `db:"is_public"      json:"is_public"`
}
