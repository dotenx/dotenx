package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

/*
Important Note: at the moment all the fields of the task bodies should be of type `string` as they can be set to a variable. In the future add a concept of YAML schema
and do some validation there.
*/

type TaskBody interface {
	Value() (driver.Value, error)
	Scan(interface{}) error
}

type TaskBodyMap map[string]interface{}

func (t TaskBodyMap) Value() (driver.Value, error) {
	return json.Marshal(t)
}

func (t *TaskBodyMap) Scan(value interface{}) error {
	if b, ok := value.([]byte); ok {
		return json.Unmarshal(b, &t)
	} else {
		return errors.New("type assertion to []byte failed")
	}
}

type TaskDetails struct {
	Name           string
	Id             int
	Timeout        int         `db:"timeout" json:"timeout"`
	Type           string      `db:"task_type"`
	Body           TaskBodyMap `db:"body" json:"body"`
	ServiceAccount string      `db:"service_account" json:"serviceAccount"`
	AccountId      string      `db:"account_id" json:"account_id"`
}
type TaskStatusSummery struct {
	Id     int
	Name   string `json:"name"`
	Status string `json:"status"`
}

// Task Bodies
type HttpCallTaskBody struct {
	Method string                 `db:"method" json:"method" yaml:"method"`
	URL    string                 `db:"method" json:"url" yaml:"url"`
	Body   map[string]interface{} `db:"body" json:"body" yaml:"body"`
}

func (b HttpCallTaskBody) Value() (driver.Value, error) {
	return json.Marshal(b)
}

func (b HttpCallTaskBody) Scan(value interface{}) error {
	if bytes, ok := value.([]byte); ok {
		return json.Unmarshal(bytes, &b)
	} else {
		return errors.New("type assertion to []byte failed")
	}
}

type GitlabAddMemberTaskBody struct {
	PrivateToken string `yaml:"privateToken" json:"privateToken"`
	ID           string `yaml:"id" json:"id"`
	UserID       string `yaml:"userId" json:"userId"`
	AccessLevel  string `yaml:"accessLevel" json:"accessLevel"`
	ExpiresAt    string `yaml:"expiresAt,omitempty" json:"expiresAt"`
	Type         string `yaml:"type" json:"type"`
}

func (b GitlabAddMemberTaskBody) Value() (driver.Value, error) {
	return json.Marshal(b)
}

func (b GitlabAddMemberTaskBody) Scan(value interface{}) error {
	if bytes, ok := value.([]byte); ok {
		return json.Unmarshal(bytes, &b)
	} else {
		return errors.New("type assertion to []byte failed")
	}
}

type GitlabRemoveMemberTaskBody struct {
	PrivateToken string `yaml:"privateToken" json:"privateToken"`
	ID           string `yaml:"id" json:"id"`
	UserID       string `yaml:"userId" json:"userId"`
	Type         string `yaml:"type" json:"type"`
}

func (b GitlabRemoveMemberTaskBody) Value() (driver.Value, error) {
	return json.Marshal(b)
}

func (b GitlabRemoveMemberTaskBody) Scan(value interface{}) error {
	if bytes, ok := value.([]byte); ok {
		return json.Unmarshal(bytes, &b)
	} else {
		return errors.New("type assertion to []byte failed")
	}
}

type DefaultTaskBody map[string]interface{}

func (b DefaultTaskBody) Value() (driver.Value, error) {
	return json.Marshal(b)
}

func (b DefaultTaskBody) Scan(value interface{}) error {
	if bytes, ok := value.([]byte); ok {
		return json.Unmarshal(bytes, &b)
	} else {
		return errors.New("type assertion to []byte failed")
	}
}

type TaskResultDto struct {
	TaskId int `json:"task_id"`
	//ExecutionId int    `json:"execution_id"`
	Status    string `json:"status"`
	AccountId string `json:"account_id"`
	Log       string `json:"log"`
	Error     string `json:"error"`
}
