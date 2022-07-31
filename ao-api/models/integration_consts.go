package models

import (
	"fmt"
	"io/ioutil"
	"os"
	"strings"

	"github.com/dotenx/dotenx/ao-api/config"
	"gopkg.in/yaml.v2"
)

var AvaliableIntegrations map[string]IntegrationDefinition

func init() {
	AvaliableIntegrations = make(map[string]IntegrationDefinition)
	var address string
	if config.Configs.App.RunLocally && os.Getenv("RUNNING_IN_DOCKER") != "true" { // This is only for the case we run ao-api without docker and locally
		address = "../integrations"
	} else {
		address = "integrations"
	}

	// if os.Args[0] has ".test" as suffix meaning that we are in test mode
	if strings.HasSuffix(os.Args[0], ".test") {
		address = "../../../integrations"
	}

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
