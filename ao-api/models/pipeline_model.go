package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"

	"gopkg.in/yaml.v2"
)

type Pipeline struct {
	Id        int    `db:"id" json:"-"`
	Name      string `db:"name" json:"name"`
	Endpoint  string `db:"endpoint" json:"endpoint"`
	AccountId string `db:"account_id" json:"-"`
}

type PipelineVersion struct {
	Id             string   `db:"id" json:"-" yaml:"-"`
	PipelineId     int16    `db:"pipeline_id" json:"-"  yaml:"-"`
	Manifest       Manifest `db:"manifest" json:"manifest" yaml:"manifest"`
	Version        int16    `db:"version" json:"version" yaml:"version"`
	FromVersion    int16    `db:"from_version" json:"fromVersion" yaml:"fromVersion"`
	ServiceAccount string   `db:"service_account" json:"serviceAccount" yaml:"serviceAccount"`
}

type PipelineVersionSummary struct {
	Version     int
	FromVersion int `db:"from_version"`
}

type PipelineDto struct {
	Name           string
	ServiceAccount string `yaml:"serviceAccount"`
	Manifest       Manifest
}

type Manifest struct {
	Triggers map[string]Trigger `db:"triggers" json:"triggers" yaml:"triggers,omitempty"`
	Tasks    map[string]Task    `db:"tasks" json:"tasks" yaml:"tasks"`
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

type Trigger struct {
	Type TriggerType `db:"trigger_type" json:"type" yaml:"type"`
	Body TriggerBody `db:"body" json:"body" yaml:"body,omitempty"`
}

type Task struct {
	Id           int                 `db:"id" json:"id" yaml:"-"`
	Name         string              `db:"name" json:"-" yaml:"-"`
	ExecuteAfter map[string][]string `db:"execute_after" json:"executeAfter" yaml:"executeAfter,omitempty"`
	Type         TaskType            `db:"task_type" json:"type" yaml:"type"`
	Body         TaskBody            `db:"body" json:"body" yaml:"body"`
	Description  string              `db:"description" json:"description" yaml:"description"`
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
	var typeUnmarshaled TaskType
	typeBytes, err := json.Marshal(raw["type"])
	if err != nil {
		return err
	}
	json.Unmarshal(typeBytes, &typeUnmarshaled)
	t.Type = typeUnmarshaled
	body, err := json.Marshal(raw["body"])
	if err != nil {
		return err
	}
	switch t.Type {
	case HttpCall:
		var taskBody HttpCallTaskBody
		json.Unmarshal(body, &taskBody)
		t.Body = taskBody
	case CreateAccount:
		var taskBody CreateAccountTaskBody
		json.Unmarshal(body, &taskBody)
		t.Body = taskBody
	case GitlabAddMember:
		var taskBody GitlabAddMemberTaskBody
		json.Unmarshal(body, &taskBody)
		t.Body = taskBody
	case GitlabRemoveMember:
		var taskBody GitlabRemoveMemberTaskBody
		json.Unmarshal(body, &taskBody)
		t.Body = taskBody
	case Default:
		var taskBody DefaultTaskBody
		json.Unmarshal(body, &taskBody)
		t.Body = taskBody
	}
	return nil
}

func (t *Task) UnmarshalYAML(unmarshal func(interface{}) error) error {
	var raw map[string]interface{}
	if err := unmarshal(&raw); err != nil {
		return err
	}
	*t = Task{}
	var executeAfter map[string][]string
	executeAfterBytes, err := yaml.Marshal(raw["executeAfter"])
	if err != nil {
		return err
	}
	yaml.Unmarshal(executeAfterBytes, &executeAfter)
	t.ExecuteAfter = executeAfter
	var typeUnmarshaled TaskType
	typeBytes, err := yaml.Marshal(raw["type"])
	if err != nil {
		return err
	}
	err = yaml.Unmarshal(typeBytes, &typeUnmarshaled)
	if err != nil {
		return err
	}
	t.Type = typeUnmarshaled
	body, err := yaml.Marshal(raw["body"])
	if err != nil {
		return err
	}
	switch t.Type {
	case HttpCall:
		var taskBody HttpCallTaskBody
		yaml.Unmarshal(body, &taskBody)
		t.Body = taskBody
	case CreateAccount:
		var taskBody CreateAccountTaskBody
		yaml.Unmarshal(body, &taskBody)
		t.Body = taskBody
	case GitlabAddMember:
		var taskBody GitlabAddMemberTaskBody
		yaml.Unmarshal(body, &taskBody)
		t.Body = taskBody
	case GitlabRemoveMember:
		var taskBody GitlabRemoveMemberTaskBody
		yaml.Unmarshal(body, &taskBody)
		t.Body = taskBody
	case Default:
		var taskBody DefaultTaskBody
		yaml.Unmarshal(body, &taskBody)
		t.Body = taskBody
	}
	return nil
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
