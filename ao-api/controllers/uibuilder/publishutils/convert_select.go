package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type Select struct {
	kind       string        `json:"kind"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
	RepeatFrom struct {
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
		Multiple     bool   `json:"multiple"`
		Options      []struct {
			Label string `json:"label"`
			Value string `json:"value"`
		} `json:"options"`
	} `json:"data"`
}

const selectTemplate = `<select {{if .Bindings.Class.FromStateName}}:class="{{renderClassBinding .Bindings}}"{{end}} {{if or .Bindings.Show.FromStateName .Bindings.Hide.FromStateName}}x-show="{{renderBindings .Bindings}}"{{end}} id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}" {{if .Data.Multiple}}multiple{{end}} x-data="{ options: {{.Data.Options}} }"  x-model="formData.{{.Data.Name}}" {{if .Data.DefaultValue}} x-init="formData.{{.Data.Name}}='{{.Data.DefaultValue}}'" {{end}}><template x-for="option in options" :key="option"><option x-text="option.label" :value="option.value" :selected="{{if .Data.Multiple}}formData.{{.Data.Name}} === option.value{{else}}formData.{{.Data.Name}}.lastIndexOf(option.value) != -1{{end}}"></option></template></select>`

func convertSelect(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	funcMap := template.FuncMap{
		"renderClassBinding": RenderClassBinding,
		"renderBindings":     RenderShowHideBindings,
	}
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var sel Select
	json.Unmarshal(b, &sel)
	// fmt.Printf("%#v\n", sel)
	tmpl, err := template.New("sel").Funcs(funcMap).Parse(selectTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, sel)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(sel.Id, sel.Data.Style.Desktop, sel.Data.Style.Tablet, sel.Data.Style.Mobile)

	return out.String(), nil
}
