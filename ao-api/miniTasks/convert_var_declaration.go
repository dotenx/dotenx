package miniTasks

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type VarDeclaration struct {
	Type   string `json:"type"`
	Name   string `json:"name"`
	Params struct {
		Name string `json:"name"`
	} `json:"params"`
}

const varDeclarationTemplate = "var {{.Name}};"

func convertVarDeclaration(step map[string]interface{}) (string, error) {
	b, err := json.Marshal(step)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var varDeclaration VarDeclaration
	json.Unmarshal(b, &varDeclaration)
	fmt.Printf("%#v\n", varDeclaration)
	tmpl, err := template.New("varDeclaration").Parse(varDeclarationTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var out bytes.Buffer
	err = tmpl.Execute(&out, varDeclaration.Params)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	fmt.Println(out.String())
	return out.String(), nil
}
