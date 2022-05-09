package models

import (
	"bytes"
	"database/sql/driver"
	"encoding/json"
)

type TaskDefinition struct {
	Service      string `json:"service" yaml:"service"`
	Type         string
	Fields       []TaskField
	Image        string
	Integrations []string
	Author       string      `json:"author" yaml:"author"`
	Icon         string      `json:"icon" yaml:"icon"`
	NodeColor    string      `json:"node_color" yaml:"node_color"`
	Description  string      `json:"description" yaml:"description"`
	Outputs      []TaskField `json:"outputs" yaml:"outputs"`
}

var AvaliableTasks map[string]TaskDefinition

type TaskField struct {
	Key         string `json:"key" yaml:"key"`
	Type        string `json:"type" yaml:"type"`
	Description string `json:"description" yaml:"description"`
}

// Task Status
type TaskStatus int

const (
	Success TaskStatus = iota
	Failed
	Timedout
	Started
	Cancelled
	Completed
	Wating
)

var taskStatusToString = map[TaskStatus]string{
	Success:   "success",
	Failed:    "failed",
	Timedout:  "timedout",
	Started:   "started",
	Cancelled: "cancelled",
	Completed: "completed",
	Wating:    "waiting",
}

var taskStatusToId = map[string]TaskStatus{
	"success":   Success,
	"failed":    Failed,
	"timedout":  Timedout,
	"started":   Started,
	"cancelled": Cancelled,
	"completed": Completed,
	"waiting":   Wating,
}

func (t TaskStatus) String() string {
	return taskStatusToString[t]
}

func (t TaskStatus) Value() (driver.Value, error) {
	return json.Marshal(t)
}

func (t *TaskStatus) Scan(value interface{}) error {
	strValue := value.(string)
	*t = taskStatusToId[strValue]
	return nil
}

func TaskStatusValues() []string {
	values := make([]string, len(taskStatusToId))
	i := 0
	for key := range taskStatusToId {
		values[i] = key
		i++
	}
	return values
}

// MarshalJSON marshals the enum as a quoted json string
func (t TaskStatus) MarshalJSON() ([]byte, error) {
	buffer := bytes.NewBufferString(`"`)
	buffer.WriteString(taskStatusToString[t])
	buffer.WriteString(`"`)
	return buffer.Bytes(), nil
}

// UnmarshalJSON unmarshals a quoted json string to the enum value
func (t *TaskStatus) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	// Note that if the string cannot be found then it will be set to the zero value, 'Success' in this case.
	*t = taskStatusToId[s]
	return nil
}
