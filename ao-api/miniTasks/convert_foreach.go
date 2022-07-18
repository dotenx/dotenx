package miniTasks

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type Foreach struct {
	Type   string `json:"type"`
	Name   string `json:"name"`
	Params struct {
		Collection string        `json:"collection"`
		Iterator   string        `json:"iterator"`
		Body       []interface{} `json:"body"`
	} `json:"params"`
}

const foreachTemplate = `for ({{.Iterator}} of {{.Collection}}) {
{{.RenderedBody}}
}`

func convertForeach(step map[string]interface{}, importStore *ImportStore) (string, error) {
	b, err := json.Marshal(step)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var foreach Foreach
	json.Unmarshal(b, &foreach)
	fmt.Printf("%#v\n", foreach)
	tmpl, err := template.New("foreach").Parse(foreachTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	body, err := ConvertToCode(foreach.Params.Body, importStore)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	params := struct {
		Iterator     string
		Collection   string
		RenderedBody string
	}{
		foreach.Params.Iterator,
		foreach.Params.Collection,
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
