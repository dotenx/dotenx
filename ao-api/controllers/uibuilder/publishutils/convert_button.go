package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type Button struct {
	Kind       string        `json:"kind"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
	RepeatFrom struct {
		Name     string
		Iterator string
	} `json:"repeatFrom"`
	Events     []Event  `json:"events"`
	Bindings   Bindings `json:"bindings"`
	ClassNames []string `json:"classNames"`
	ElementId  string   `json:"elementId"`
	Data       struct {
		Style struct {
			Desktop StyleModes `json:"desktop"`
			Tablet  StyleModes `json:"tablet"`
			Mobile  StyleModes `json:"mobile"`
		} `json:"style"`
		Text string `json:"text"`
	} `json:"data"`
}

const buttonTemplate = `{{if .RepeatFrom.Name}}<template x-for="({{.RepeatFrom.Iterator}}, index) in {{renderRepeatFromName .RepeatFrom.Name}}">{{end}}<button {{if .Bindings.Class.FromStateName}}:class="{{renderClassBinding .Bindings}}"{{end}} {{if or .Bindings.Show.FromStateName .Bindings.Hide.FromStateName}}x-show="{{renderBindings .Bindings}}"{{end}}   {{renderEvents .Events}} {{if .RepeatFrom.Name}}:key="index"{{end}} id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}">{{.Data.Text}}</button>{{if .RepeatFrom.Name}}</template>{{end}}`

func convertButton(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	funcMap := template.FuncMap{
		"renderClassBinding":   RenderClassBinding,
		"renderBindings":       RenderShowHideBindings,
		"renderEvents":         renderEvents,
		"renderRepeatFromName": renderRepeatFromName,
	}
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var button Button

	json.Unmarshal(b, &button)
	tmpl, err := template.New("button").Funcs(funcMap).Parse(buttonTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	params := struct {
		Button
	}{
		button,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(button.Events)

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(button.Id, button.Data.Style.Desktop, button.Data.Style.Tablet, button.Data.Style.Mobile)

	return out.String(), nil
}
