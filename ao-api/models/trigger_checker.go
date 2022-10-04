package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

type TriggerObjectList map[string]interface{}

func (t TriggerObjectList) Value() (driver.Value, error) {
	return json.Marshal(t)
}

func (t *TriggerObjectList) Scan(value interface{}) error {
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

type TriggerChecker struct {
	AccountId    string            `db:"account_id"    json:"account_id"`
	ProjectName  string            `db:"project_name"  json:"project_name"`
	PipelineName string            `db:"pipeline_name" json:"pipeline_name"`
	TriggerName  string            `db:"trigger_name"  json:"trigger_name"`
	List         TriggerObjectList `db:"list"  json:"list"`
}
