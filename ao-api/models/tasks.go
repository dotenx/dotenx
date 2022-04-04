package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"io/fs"
	"io/ioutil"
	"path/filepath"

	"gopkg.in/yaml.v2"
)

type TaskBody interface {
	Value() (driver.Value, error)
	Scan(interface{}) error
}

type TaskBodyMap map[string]interface{}

func (t TaskBodyMap) Value() (driver.Value, error) {
	return json.Marshal(t)
}

func (t TaskBodyMap) Scan(value interface{}) error {
	if b, ok := value.([]byte); ok {
		return json.Unmarshal(b, &t)
	} else {
		return errors.New("type assertion to []byte failed")
	}
}

type ReturnValue interface {
	Value() (driver.Value, error)
	Scan(interface{}) error
}

type ReturnValueMap map[string]interface{}

func (t ReturnValueMap) Value() (driver.Value, error) {
	return json.Marshal(t)
}

func (t ReturnValueMap) Scan(value interface{}) error {
	if b, ok := value.([]byte); ok {
		return json.Unmarshal(b, &t)
	} else {
		return errors.New("type assertion to []byte failed")
	}
}

type TaskDetails struct {
	Name        string
	Id          int
	Timeout     int         `db:"timeout" json:"timeout"`
	Type        string      `db:"task_type"`
	Body        TaskBodyMap `db:"body" json:"body"`
	AccountId   string      `db:"account_id" json:"account_id"`
	Integration string      `db:"integration" json:"integration"`
}

type TaskStatusSummery struct {
	Id     int
	Name   string `json:"name"`
	Status string `json:"status"`
}

type TaskResultDto struct {
	TaskId int `json:"task_id"`
	//ExecutionId int    `json:"execution_id"`
	Status    string `json:"status"`
	AccountId string `json:"account_id"`
	Log       string `json:"log"`
	Error     string `json:"error"`
}

func init() {
	AvaliableTasks = make(map[string]TaskDefinition)
	filepath.WalkDir("tasks", walkTasks)
}

func readTaskFile(addr string) {
	var yamlFile TaskDefinition
	yamlData, err := ioutil.ReadFile(addr)
	if err != nil {
		panic(err)
	}
	err = yaml.Unmarshal(yamlData, &yamlFile)
	if err != nil {
		panic(err)
	}
	if yamlFile.Fields == nil {
		yamlFile.Fields = make([]TaskField, 0)
	}
	if yamlFile.Outputs == nil {
		yamlFile.Outputs = make([]TaskField, 0)
	}
	if yamlFile.Integrations == nil {
		yamlFile.Integrations = make([]string, 0)
	}
	AvaliableTasks[yamlFile.Type] = yamlFile
}

func walkTasks(s string, d fs.DirEntry, err error) error {
	if err != nil {
		return err
	}
	if !d.IsDir() {
		readTaskFile(s)
	}
	return nil
}
