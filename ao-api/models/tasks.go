package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"

	"gopkg.in/yaml.v2"
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

func (t TaskBodyMap) Scan(value interface{}) error {
	if b, ok := value.([]byte); ok {
		return json.Unmarshal(b, &t)
	} else {
		return errors.New("type assertion to []byte failed")
	}
}

type TaskDetails struct {
	Name      string
	Id        int
	Timeout   int               `db:"timeout" json:"timeout"`
	Type      string            `db:"task_type"`
	Body      TaskBodyMap       `db:"body" json:"body"`
	AccountId string            `db:"account_id" json:"account_id"`
	FieldMap  map[string]string `db:"field_map" json:"field_map"`
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
	address := "tasks"
	files, err := ioutil.ReadDir(address)
	if err != nil {
		panic(err)
	}
	for _, file := range files {
		var yamlFile TaskDefinition
		yamlData, err := ioutil.ReadFile(address + "/" + file.Name())
		if err != nil {
			panic(err)
		}
		err = yaml.Unmarshal(yamlData, &yamlFile)
		if err != nil {
			panic(err)
		}

		AvaliableTasks[yamlFile.Type] = yamlFile
	}
	fmt.Println(AvaliableTasks)
}
