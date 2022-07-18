package miniTasks

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type Repeat struct {
	Type   string `json:"type"`
	Name   string `json:"name"`
	Params struct {
		Count    string        `json:"count"`
		Iterator string        `json:"iterator"`
		Body     []interface{} `json:"body"`
	} `json:"params"`
}

const repeatTemplate = `for({{.Iterator}} = 0; {{.Iterator}} < {{.Count}}; {{.Iterator}}++) {
{{.RenderedBody}}
}`

func convertRepeat(step map[string]interface{}, importStore *ImportStore) (string, error) {
	b, err := json.Marshal(step)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var repeat Repeat
	json.Unmarshal(b, &repeat)
	fmt.Printf("%#v\n", repeat)
	tmpl, err := template.New("repeat").Parse(repeatTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	body, err := ConvertToCode(repeat.Params.Body, importStore)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	params := struct {
		Iterator     string
		Count        string
		RenderedBody string
	}{
		repeat.Params.Iterator,
		repeat.Params.Count,
		body,
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
