package miniTasks

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
)

type ExecuteTask struct {
	Type   string `json:"type"`
	Name   string `json:"name"`
	Params struct {
		Output  string                 `json:"output"`
		Url     string                 `json:"url"`
		Headers map[string]interface{} `json:"headers"`
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
{{if .Output}}{{.Output}}={{.Output}}.return_value?.outputs;{{end}}
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
	// headers, _ := json.Marshal(executeTask.Params.Headers)
	// body, _ := json.Marshal(executeTask.Params.Body)
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
		Headers:    addEvalToBodyValues(executeTask.Params.Headers),
		Body:       addEvalToBodyValues(executeTask.Params.Body),
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

func addEvalToBodyValues(body map[string]interface{}) string {
	pairs := make([]string, 0)
	for key, val := range body {
		res := ""
		// TODO: we should add eval just for body of tasks not 'integration' and 'type' fields
		// so in future we can change condition below or ui to add \" for 'integration' and 'type' fields
		if valStr, ok := val.(string); ok && valStr != "" && key != "integration" && key != "type" {
			if strings.Index(valStr, "\"") == 0 {
				bare := strings.TrimPrefix(valStr, "\"")
				bare = strings.TrimSuffix(bare, "\"")
				res = fmt.Sprintf("\"%s\":eval(\"\\\"%s\\\"\")", key, bare)
			} else {
				res = fmt.Sprintf("\"%s\":eval(\"%s\")", key, valStr)
			}
		} else if valMap, ok := val.(map[string]interface{}); ok {
			res = fmt.Sprintf("\"%s\":%s", key, addEvalToBodyValues(valMap))
		} else {
			valBytes, _ := json.Marshal(val)
			res = fmt.Sprintf("\"%s\":%s", key, string(valBytes))
		}
		pairs = append(pairs, res)
	}
	result := strings.Join(pairs, ",")
	result = strings.TrimSuffix(result, ",")
	result = fmt.Sprintf("{%s}", result)
	return result
}
