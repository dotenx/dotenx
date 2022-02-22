package models

import (
	"fmt"
	"io/ioutil"

	"gopkg.in/yaml.v2"
)

var AvaliableIntegrations map[string]IntegrationDefinition

var AvaliableIntegrationFields = map[string]IntegrationField{
	"access_token": {Type: "text", Key: "access_token"},
	"key":          {Type: "text", Key: "key"},
	"secret":       {Type: "text", Key: "secret"},
	"url":          {Type: "text", Key: "url"},
}

type IntegrationFile struct {
	Type             string `yaml:"type"`
	NeedsAccessToken bool   `yaml:"needs_access_token"`
	NeedsKey         bool   `yaml:"needs_key"`
	NeedsSecret      bool   `yaml:"needs_secret"`
	NeedsUrl         bool   `yaml:"needs_url"`
}

type Integration struct {
	Name       string                `db:"name" json:"name"`
	AccountId  string                `db:"account_id" json:"account_id"`
	Definition IntegrationDefinition `json:"definition"`
}

type IntegrationDefinition struct {
	Type   string             `json:"type"`
	Fields []IntegrationField `json:"fields"`
}

func (intg IntegrationDefinition) IsValid() bool {
	for _, field := range intg.Fields {
		if field.Value == "" {
			return false
		}
	}
	return true
}

type IntegrationField struct {
	Key   string `json:"key"`
	Type  string `json:"type"`
	Value string `json:"value"`
}

func init() {
	AvaliableIntegrations = make(map[string]IntegrationDefinition)
	address := "integrations"
	files, err := ioutil.ReadDir(address)
	if err != nil {
		panic(err)
	}
	for _, file := range files {
		var yamlFile IntegrationFile
		yamlData, err := ioutil.ReadFile(address + "/" + file.Name())
		if err != nil {
			panic(err)
		}
		err = yaml.Unmarshal(yamlData, &yamlFile)
		if err != nil {
			panic(err)
		}
		integrationDefinition := IntegrationDefinition{Type: yamlFile.Type, Fields: make([]IntegrationField, 0)}
		if yamlFile.NeedsAccessToken {
			integrationDefinition.Fields = append(integrationDefinition.Fields, AvaliableIntegrationFields["access_token"])
		}
		if yamlFile.NeedsKey {
			integrationDefinition.Fields = append(integrationDefinition.Fields, AvaliableIntegrationFields["key"])
		}
		if yamlFile.NeedsSecret {
			integrationDefinition.Fields = append(integrationDefinition.Fields, AvaliableIntegrationFields["secret"])
		}
		if yamlFile.NeedsUrl {
			integrationDefinition.Fields = append(integrationDefinition.Fields, AvaliableIntegrationFields["url"])
		}
		AvaliableIntegrations[integrationDefinition.Type] = integrationDefinition
	}
	fmt.Println(AvaliableIntegrations)
}
