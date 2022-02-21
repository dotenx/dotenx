package models

import (
	"fmt"
	"io/ioutil"

	"gopkg.in/yaml.v2"
)

var AvaliableIntegrations map[string]IntegrationDefinition

type IntegrationDefinition struct {
	Type             string `yaml:"type"`
	NeedsAccessToken bool   `yaml:"needs_access_token"`
	NeedsKey         bool   `yaml:"needs_key"`
	NeedsSecret      bool   `yaml:"needs_secret"`
	NeedsUrl         bool   `yaml:"needs_url"`
}

func init() {
	AvaliableIntegrations = make(map[string]IntegrationDefinition)
	address := "integrations"
	files, err := ioutil.ReadDir(address)
	if err != nil {
		panic(err)
	}
	for _, file := range files {
		var yamlFile IntegrationDefinition
		yamlData, err := ioutil.ReadFile(address + "/" + file.Name())
		if err != nil {
			panic(err)
		}
		err = yaml.Unmarshal(yamlData, &yamlFile)
		if err != nil {
			panic(err)
		}
		AvaliableIntegrations[yamlFile.Type] = yamlFile
	}
	fmt.Println(AvaliableIntegrations)
}
