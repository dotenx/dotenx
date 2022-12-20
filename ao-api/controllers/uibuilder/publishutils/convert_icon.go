package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type Icon struct {
	Kind       string        `json:"kind"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
	Events     []Event       `json:"events"`
	Bindings   Bindings      `json:"bindings"`
	RepeatFrom struct {
		Name     string
		Iterator string
	} `json:"repeatFrom"`
	ClassNames []string `json:"classNames"`
	ElementId  string   `json:"elementId"`
	Data       struct {
		Style struct {
			Desktop StyleModes `json:"desktop"`
			Tablet  StyleModes `json:"tablet"`
			Mobile  StyleModes `json:"mobile"`
		} `json:"style"`
		Name string `json:"name"`
		Type string `json:"type"`
	} `json:"data"`
}

const iconTemplate = `{{if .RepeatFrom.Name}}<template x-for="(index, {{.RepeatFrom.Iterator}}) in {{renderRepeatFromName .RepeatFrom.Name}}">{{end}}<i {{if .Bindings.Class.FromStateName}}:class="{{renderClassBinding .Bindings}}"{{end}} {{if or .Bindings.Show.FromStateName .Bindings.Hide.FromStateName}}x-show="{{renderBindings .Bindings}}"{{end}} {{if .VisibleAnimation.AnimationName}}x-intersect-class{{if .VisibleAnimation.Once}}.once{{end}}="animate__animated animate__{{.VisibleAnimation.AnimationName}}"{{end}} {{renderEvents .Events}} {{if .RepeatFrom.Name}}:key="index"{{end}} id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{.Data.Type}} fa-{{.Data.Name}} {{range .ClassNames}}{{.}} {{end}}"></i>{{if .RepeatFrom.Name}}</template>{{end}}`

func convertIcon(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
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
	var icon Icon
	json.Unmarshal(b, &icon)
	tmpl, err := template.New("icon").Funcs(funcMap).Parse(iconTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	visibleAnimation, events := PullVisibleAnimation(icon.Events)
	icon.Events = events

	params := struct {
		Icon
		VisibleAnimation VisibleAnimation
	}{
		icon,
		visibleAnimation,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(icon.Events)

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(icon.Id, icon.Data.Style.Desktop, icon.Data.Style.Tablet, icon.Data.Style.Mobile)

	return out.String(), nil
}
