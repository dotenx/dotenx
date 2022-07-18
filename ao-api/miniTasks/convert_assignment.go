package miniTasks

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type Assignment struct {
	Type   string `json:"type"`
	Name   string `json:"name"`
	Params struct {
		Name  string `json:"name"`
		Value string `json:"value"`
	} `json:"params"`
}

const assignmentTemplate = "var {{.Name}} = {{.Value}};"

func convertAssignment(step map[string]interface{}) (string, error) {
	b, err := json.Marshal(step)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var assignment Assignment
	json.Unmarshal(b, &assignment)
	fmt.Printf("%#v\n", assignment)
	tmpl, err := template.New("assignment").Parse(assignmentTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var out bytes.Buffer
	err = tmpl.Execute(&out, assignment.Params)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	fmt.Println(out.String())
	return out.String(), nil
}
