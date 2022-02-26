package models

import (
	"fmt"
	"io/ioutil"

	"gopkg.in/yaml.v2"
)

var AvaliableTriggers map[string]TriggerDefinition

type TriggerDefinition struct {
	Type            string `yaml:"type"`
	IntegrationType string `yaml:"integration"`
	Image           string `yaml:"image"`
}

type EventTrigger struct {
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
		AvaliableTriggers[yamlFile.Type] = yamlFile
	}
	fmt.Println(AvaliableTriggers)
}
