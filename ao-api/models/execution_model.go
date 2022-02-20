package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type InputData map[string]interface{}

func (e InputData) Value() (driver.Value, error) {
	return json.Marshal(e)
}

func (e *InputData) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion .([]byte) failed")
	}

	var i interface{}
	err := json.Unmarshal(b, &i)
	if err != nil {
		return err
	}

	*e, ok = i.(map[string]interface{})
	if !ok {
		return errors.New("type assertion .(map[string]interface{}) failed")
	}

	return nil
}

type Execution struct {
	Id                int
	PipelineVersionId int       `db:"pipeline_version_id"`
	StartedAt         time.Time `db:"started_at"`
	InitialData       InputData `db:"initial_data"`
}
