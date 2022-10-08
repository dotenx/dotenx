package miniTasks

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type FunctionCall struct {
	Type   string `json:"type"`
	Name   string `json:"name"`
	Params struct {
		Output    string        `json:"output"`
		Name      string        `json:"name"`
		Arguments []interface{} `json:"arguments"`
	} `json:"params"`
}

const functionCallTemplate = "{{if .Output}}var {{.Output}}= {{end}}await{{.Name}}({{range $index, $element := .Arguments}}{{if $index}}, {{end}}{{$element}}{{end}});"

func convertFunctionCall(step map[string]interface{}, importStore *ImportStore) (string, error) {
	b, err := json.Marshal(step)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var functionCall FunctionCall
	json.Unmarshal(b, &functionCall)

	importStore.AddImport(functionCall.Params.Name)

	tmpl, err := template.New("functionCall").Parse(functionCallTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var out bytes.Buffer
	err = tmpl.Execute(&out, functionCall.Params)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	fmt.Println(out.String())
	return out.String(), nil
}
