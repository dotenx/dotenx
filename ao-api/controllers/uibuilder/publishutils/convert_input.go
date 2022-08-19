package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type Input struct {
	kind       string        `json:"kind"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
	Data       struct {
		Style struct {
			Desktop map[string]string `json:"desktop"`
			Tablet  map[string]string `json:"tablet"`
			Mobile  map[string]string `json:"mobile"`
		} `json:"style"`
		DefaultValue string `json:"defaultValue"`
		Name         string `json:"name"`
		Placeholder  string `json:"placeholder"`
		Required     bool   `json:"required"`
		Type         string `json:"type"`
		Value        string `json:"value"`
	} `json:"data"`
}

const inputTemplate = `<input type="{{.Data.Type}}" id="{{.Id}}" placeholder="{{.Data.Placeholder}}" value="{{.Data.Value}}"/>`

func convertInput(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var input Input
	json.Unmarshal(b, &input)
	tmpl, err := template.New("input").Parse(inputTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, input)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(input.Id, input.Data.Style.Desktop, input.Data.Style.Tablet, input.Data.Style.Mobile)

	return out.String(), nil
}
