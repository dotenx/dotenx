package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type Input struct {
	Kind       string        `json:"kind"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
	RepeatFrom struct {      // We're currently ignoring this field for inputs
		Name     string
		Iterator string
	} `json:"repeatFrom"`
	ClassNames []string `json:"classNames"`
	ElementId  string   `json:"elementId"`
	Bindings   Bindings `json:"bindings"`
	Data       struct {
		Style struct {
			Desktop StyleModes `json:"desktop"`
			Tablet  StyleModes `json:"tablet"`
			Mobile  StyleModes `json:"mobile"`
		} `json:"style"`
		DefaultValue string `json:"defaultValue"`
		Name         string `json:"name"`
		Placeholder  string `json:"placeholder"`
		Required     bool   `json:"required"`
		Type         string `json:"type"`
		Value        string `json:"value"`
	} `json:"data"`
}

const inputTemplate = `<input {{if .Bindings.Show.FromStateName}}x-show="{{renderBindings .Bindings}}"{{end}} type="{{.Data.Type}}" id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}" placeholder="{{.Data.Placeholder}}" x-model="formData.{{.Data.Name}}" {{if .Data.DefaultValue}} x-init="formData.{{.Data.Name}}='{{.Data.DefaultValue}}'" {{end}}/>`

func convertInput(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	funcMap := template.FuncMap{
		"renderBindings": RenderBindings,
	}
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var input Input
	json.Unmarshal(b, &input)
	tmpl, err := template.New("input").Funcs(funcMap).Parse(inputTemplate)
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
