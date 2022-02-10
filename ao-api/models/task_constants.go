package models

import (
	"bytes"
	"database/sql/driver"
	"encoding/json"
)

// Task Type
type TaskType int

const (
	Invalid TaskType = iota
	HttpCall
	CreateAccount
	GitlabAddMember
	GitlabRemoveMember
	Default
)

var AvaliableTasks = []string{
	"HttpCall",
	"GitlabAddMember",
	"GitlabRemoveMember",
	"default",
}

var PredefiniedTaskToImage = map[string]string{
	"HttpCall":           "awrmin/utopiopshttpcall",
	"GitlabAddMember":    "awrmin/change_gitlab_members",
	"GitlabRemoveMember": "awrmin/change_gitlab_members",
	"default":            "",
}

var TaskToFields = map[string][]TaskField{
	"HttpCall": {
		TaskField{
			Key:  "url",
			Type: "text",
		},
		TaskField{
			Key:  "method",
			Type: "text",
		},
		TaskField{
			Key:  "body",
			Type: "json",
		},
	},
	"GitlabAddMember": {
		TaskField{
			Key:  "privateToken",
			Type: "text",
		},
		TaskField{
			Key:  "id",
			Type: "text",
		},
		TaskField{
			Key:  "userId",
			Type: "text",
		},
		TaskField{
			Key:  "accessLevel",
			Type: "text",
		},
		TaskField{
			Key:  "expiresAt",
			Type: "text",
		},
		TaskField{
			Key:  "type",
			Type: "text",
		},
	},
	"GitlabRemoveMember": {
		TaskField{
			Key:  "privateToken",
			Type: "text",
		},
		TaskField{
			Key:  "id",
			Type: "text",
		},
		TaskField{
			Key:  "userId",
			Type: "text",
		},
		TaskField{
			Key:  "type",
			Type: "text",
		},
	},
	"default": {
		TaskField{
			Key:  "image",
			Type: "text",
		},
		TaskField{
			Key:  "script",
			Type: "text",
		},
	},
}

type TaskField struct {
	Key  string `json:"key"`
	Type string `json:"type"`
}

var taskTypeToString = map[TaskType]string{
	Invalid:            "Invalid",
	HttpCall:           "HttpCall",
	CreateAccount:      "CreateAccount",
	GitlabAddMember:    "GitlabAddMember",
	GitlabRemoveMember: "GitlabRemoveMember",
	Default:            "default",
}

var taskTypeToId = map[string]TaskType{
	"Invalid":            Invalid,
	"HttpCall":           HttpCall,
	"CreateAccount":      CreateAccount,
	"GitlabAddMember":    GitlabAddMember,
	"GitlabRemoveMember": GitlabRemoveMember,
	"default":            Default,
}

func (t TaskType) String() string {
	return taskTypeToString[t]
}

func (t TaskType) Value() (driver.Value, error) {
	return json.Marshal(t)
}

func (t *TaskType) Scan(value interface{}) error {
	strValue := value.(string)
	*t = taskTypeToId[strValue]
	return nil
}

func (t TaskType) MarshalJSON() ([]byte, error) {
	buffer := bytes.NewBufferString(`"`)
	buffer.WriteString(t.String())
	buffer.WriteString(`"`)
	return buffer.Bytes(), nil
}

func (t *TaskType) UnmarshalJSON(b []byte) error {
	var j string
	if err := json.Unmarshal(b, &j); err != nil {
		return err
	}
	// Note that if the string cannot be found then it will be set to the zero value, 'HttpCall' in this case.
	*t = taskTypeToId[j]
	return nil
}

func (t TaskType) MarshalYAML() (interface{}, error) {
	return t.String(), nil
}

func (t *TaskType) UnmarshalYAML(unmarshal func(interface{}) error) error {
	var j string
	if err := unmarshal(&j); err != nil {
		return err
	}
	// Note that if the string cannot be found then it will be set to the zero value, 'HttpCall' in this case.
	*t = taskTypeToId[j]
	return nil
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
)

var taskStatusToString = map[TaskStatus]string{
	Success:   "success",
	Failed:    "failed",
	Timedout:  "timedout",
	Started:   "started",
	Cancelled: "cancelled",
	Completed: "completed",
}

var taskStatusToId = map[string]TaskStatus{
	"success":   Success,
	"failed":    Failed,
	"timedout":  Timedout,
	"started":   Started,
	"cancelled": Cancelled,
	"completed": Completed,
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

func TaskTypeValues() []string {
	values := make([]string, len(taskTypeToId))
	i := 0
	for key := range taskTypeToId {
		values[i] = key
		i++
	}
	return values
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
