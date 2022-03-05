package models

import (
	"fmt"
	"io/ioutil"

	"gopkg.in/yaml.v2"
)

type TaskDetails struct {
	Name           string   `json:"name"`
	Id             int      `json:"id"`
	Type           string   `json:"type"`
	Image          string   `json:"image"`
	Timeout        int      `json:"timeout"`
	Body           TaskBody `json:"body"`
	ServiceAccount string   `json:"serviceAccount"`
}

type TaskBody map[string]interface{}

type TaskResult struct {
	Name      string `json:"name"`
	Id        int    `json:"id"`
	Type      string `json:"type"`
	AccountId string `json:"accountId"`
	Log       string `json:"log"`
	Error     error  `json:"error"`
	Status    string `json:"status"`
}
type TaskStatus struct {
	ReturnValue interface{} `json:"returnValue"`
	Toekn       string      `json:"token"`
	Result      Status      `json:"result"`
	Logs        string      `json:"logs"`
}

type Task struct {
	Detailes             TaskDetails
	EnvironmentVariables []string
	Script               []string
	IsPredifined         bool
}

type TaskDefinition struct {
	Type   string
	Fields []TaskField
	Image  string
}

var AvaliableTasks map[string]TaskDefinition

type TaskField struct {
	Key  string `json:"key"`
	Type string `json:"type"`
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
