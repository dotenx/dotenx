package models

import (
	"fmt"
	"io/ioutil"
	"os"
	"strings"

	"gopkg.in/yaml.v2"
)

type MiniTaskDefinition struct {
	Type           string          `json:"type" yaml:"type"`
	Description    string          `json:"description" yaml:"description"`
	DisplayName    string          `json:"display_name" yaml:"display_name"`
	NumberOfParams int             `json:"number_of_params" yaml:"number_of_params"`
	Inputs         []MiniTaskField `json:"inputs" yaml:"inputs"`
	Outputs        []MiniTaskField `json:"outputs" yaml:"outputs"`
}

type MiniTaskField struct {
	Name        string `json:"name" yaml:"name"`
	Type        string `json:"type" yaml:"type"`
	Description string `json:"description" yaml:"description"`
}

var AvaliableMiniTasks []MiniTaskDefinition

func init() {
	AvaliableMiniTasks = make([]MiniTaskDefinition, 0)
	address := "miniTasks/miniTasks.yaml"

	// if os.Args[0] has ".test" as suffix meaning that we are in test mode
	if strings.HasSuffix(os.Args[0], ".test") {
		address = "../../../miniTasks/miniTasks.yaml"
	}

	var yamlFile []MiniTaskDefinition
	yamlData, err := ioutil.ReadFile(address)
	if err != nil {
		panic(err)
	}
	err = yaml.Unmarshal(yamlData, &yamlFile)
	if err != nil {
		panic(err)
	}
	AvaliableMiniTasks = yamlFile
	fmt.Println(yamlFile)
}
