package miniTasks

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
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
const executeTaskTemplate = `var {{if .Output}} {{.Output}} {{else}} {{.TempResult}} {{end}}= await http_request("{{.Url}}",{{.Headers}},{{.Body}},"{{.Method}}");
if (!{{if .Output}}{{.Output}}{{else}}{{.TempResult}}{{end}}.successfull){
	return {
		return_value: {
			successfull: false,
			error: 'UNKNOWN',
		}
	}
}
{{if .Output}}{{.Output}}={{.Output}}.return_value.outputs;{{end}}
`

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
	headers, _ := json.Marshal(executeTask.Params.Headers)
	body, _ := json.Marshal(executeTask.Params.Body)
	params := struct {
		Output     string `json:"output"`
		Url        string `json:"url"`
		Headers    string `json:"headers"`
		Body       string `json:"body"`
		Method     string `json:"method"`
		TempResult string `json:"tempResult"`
	}{
		Output:     executeTask.Params.Output,
		Url:        executeTask.Params.Url,
		Headers:    string(headers),
		Body:       string(body),
		Method:     executeTask.Params.Method,
		TempResult: "a" + utils.RandStringRunes(9, utils.FullRunes),
	}
	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	fmt.Println(out.String())
	return out.String(), nil
}
