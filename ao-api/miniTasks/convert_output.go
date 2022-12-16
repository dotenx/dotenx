package miniTasks

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type Output struct {
	Type   string `json:"type"`
	Name   string `json:"name"`
	Params struct {
		Value string `json:"value"`
	} `json:"params"`
}

const outputTemplate = "return {{.Value}};"

func convertOutput(step map[string]interface{}) (string, error) {
	b, err := json.Marshal(step)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var output Output
	json.Unmarshal(b, &output)
	fmt.Printf("%#v\n", output)
	tmpl, err := template.New("output").Parse(outputTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var out bytes.Buffer
	err = tmpl.Execute(&out, output.Params)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	fmt.Println(out.String())
	return out.String(), nil
}
