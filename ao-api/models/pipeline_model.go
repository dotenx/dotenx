package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

type Pipeline struct {
	Id            int      `db:"id" json:"-"`
	Name          string   `db:"name" json:"name"`
	Endpoint      string   `db:"endpoint" json:"endpoint"`
	AccountId     string   `db:"account_id" json:"-"`
	IsActive      bool     `db:"is_active" json:"is_active"`
	IsTemplate    bool     `db:"is_template" json:"is_template"`
	IsInteraction bool     `db:"is_interaction" json:"is_interaction"`
	IsPublic      bool     `db:"is_public" json:"is_public"`
	UserGroups    []string `db:"user_groups" json:"user_groups"`
	ProjectName   string   `db:"project_name" json:"project_name"`
	ParentId      int      `db:"parent_id" json:"parent_id"`
	CreatedFor    string   `db:"created_for" json:"created_for"`
}

type PipelineVersion struct {
	Id         string   `db:"id" json:"-" yaml:"-"`
	PipelineId int16    `db:"pipeline_id" json:"-"  yaml:"-"`
	Manifest   Manifest `db:"manifest" json:"manifest" yaml:"manifest"`
}

type PipelineDto struct {
	Name     string
	Manifest Manifest
}

type PipelineSummery struct {
	AccountId        string `db:"account_id" json:"-" yaml:"-"`
	PipelineDetailes PipelineVersion
	Endpoint         string
	IsActive         bool
	IsTemplate       bool
	IsInteraction    bool
	IsPublic         bool
	UserGroups       []string
	ProjectName      string
	ParentId         int
	CreatedFor       string
}

type Manifest struct {
	Tasks    map[string]Task         `db:"tasks" json:"tasks" yaml:"tasks"`
	Triggers map[string]EventTrigger `db:"triggers" json:"triggers" yaml:"triggers"`
}

func (m Manifest) Value() (driver.Value, error) {
	return json.Marshal(m)
}

func (m *Manifest) Scan(value interface{}) error {
	if b, ok := value.([]byte); ok {
		return json.Unmarshal(b, &m)
	} else {
		return errors.New("type assertion to []byte failed")
	}

}

type Task struct {
	Id           int                 `db:"id" json:"id" yaml:"-"`
	Name         string              `db:"name" json:"-" yaml:"-"`
	ExecuteAfter map[string][]string `db:"execute_after" json:"executeAfter" yaml:"executeAfter,omitempty"`
	Type         string              `db:"task_type" json:"type" yaml:"type"`
	AwsLambda    string              `db:"aws_lambda" json:"awsLambda"`
	Body         TaskBody            `db:"body" json:"body" yaml:"body"`
	Description  string              `db:"description" json:"description" yaml:"description"`
	Integration  string              `db:"integration" json:"integration" yaml:"integration"`
	MetaData     TaskDefinition      `json:"meta_data"`
}

func (t *Task) UnmarshalJSON(data []byte) error {
	var raw map[string]interface{}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	*t = Task{}
	var executeAfter map[string][]string
	executeAfterBytes, err := json.Marshal(raw["executeAfter"])
	if err != nil {
		return err
	}
	json.Unmarshal(executeAfterBytes, &executeAfter)
	t.ExecuteAfter = executeAfter

	var typeUnmarshaled string
	typeBytes, err := json.Marshal(raw["type"])
	if err != nil {
		return err
	}
	json.Unmarshal(typeBytes, &typeUnmarshaled)
	t.Type = typeUnmarshaled

	var integrationUnmarshaled string
	integrationBytes, err := json.Marshal(raw["integration"])
	if err != nil {
		return err
	}
	json.Unmarshal(integrationBytes, &integrationUnmarshaled)
	t.Integration = integrationUnmarshaled

	body, err := json.Marshal(raw["body"])
	if err != nil {
		return err
	}
	if !isTaskTypeValid(t.Type) {
		return errors.New("invalid task type")
	}
	var taskBody TaskBodyMap
	err = json.Unmarshal(body, &taskBody)
	if err != nil {
		return err
	}
	t.Body = taskBody

	return err
}

func (t Task) Value() (driver.Value, error) {
	return json.Marshal(t)
}

func (t *Task) Scan(value interface{}) error {
	if b, ok := value.([]byte); ok {
		return json.Unmarshal(b, &t)
	} else {
		return errors.New("type assertion to []byte failed")
	}
}

func isTaskTypeValid(taskType string) bool {
	for t, _ := range AvaliableTasks {
		if t == taskType {
			return true
		}
	}
	return false
}
