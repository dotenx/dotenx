package models

import (
	"fmt"
	"io/ioutil"

	"gopkg.in/yaml.v2"
)

var AvaliableTriggers map[string]TriggerDefinition

type TriggerDefinition struct {
	Type            string       `json:"type" yaml:"type"`
	IntegrationType string       `json:"integration" yaml:"integration"`
	Image           string       `json:"image" yaml:"image"`
	Credentials     []Credential `json:"credentials" yaml:"credentials"`
	Author          string       `json:"author" yaml:"author"`
}

type Credential struct {
	Key  string `yaml:"key"`
	Type string `yaml:"type"`
}

type EventTrigger struct {
	Name        string                 `db:"name" json:"name"`
	AccountId   string                 `db:"account_id" json:"account_id"`
	Type        string                 `db:"type" json:"type"`
	Endpoint    string                 `db:"endpoint" json:"endpoint"`
	Pipeline    string                 `db:"pipeline_name" json:"pipeline_name"`
	Integration string                 `db:"integration" json:"integration"`
	Credentials map[string]interface{} `db:"credentials" json:"credentials"`
}

func init() {
	AvaliableTriggers = make(map[string]TriggerDefinition)
	address := "triggers"
	files, err := ioutil.ReadDir(address)
	if err != nil {
		panic(err)
	}
	for _, file := range files {
		var yamlFile TriggerDefinition
		yamlData, err := ioutil.ReadFile(address + "/" + file.Name())
		if err != nil {
			panic(err)
		}
		err = yaml.Unmarshal(yamlData, &yamlFile)
		if err != nil {
			panic(err)
		}
		if yamlFile.Credentials == nil {
			yamlFile.Credentials = make([]Credential, 0)
		}
		AvaliableTriggers[yamlFile.Type] = yamlFile
	}
	fmt.Println(AvaliableTriggers)
}
