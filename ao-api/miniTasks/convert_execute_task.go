package miniTasks

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type ExecuteTask struct {
	Type   string `json:"type"`
	Name   string `json:"name"`
	Params struct {
		Output  string                 `json:"output"`
		Url     string                 `json:"url"`
		Headers map[string]string      `json:"headers"`
		Body    map[string]interface{} `json:"body"`
		Method  string                 `json:"method"`
	} `json:"params"`
}

// url, headers, body, method
const executeTaskTemplate = "{{if .Output}}var {{.Output}}= {{end}}await http_request({{.Url}},{{.Headers}},{{.Body}},{{.Method}});"

func convertExecuteTask(step map[string]interface{}, importStore *ImportStore) (string, error) {
	b, err := json.Marshal(step)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var executeTask ExecuteTask
	json.Unmarshal(b, &executeTask)

	importStore.AddImport("http_request")

	tmpl, err := template.New("executeTask").Parse(executeTaskTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var out bytes.Buffer
	err = tmpl.Execute(&out, executeTask.Params)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	fmt.Println(out.String())
	return out.String(), nil
}
