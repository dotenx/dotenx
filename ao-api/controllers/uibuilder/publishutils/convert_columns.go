package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"
)

type Columns struct {
	kind       string        `json:"type"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
	RepeatFrom struct {
		Name     string
		Iterator string
	} `json:"repeatFrom"`
	Events     []Event  `json:"events"`
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
		As           string `json:"as"`
	} `json:"data"`
}

const columnsTemplate = `{{if .RepeatFrom.Iterator}}<template {{if .RepeatFrom.Name}}x-for="{{.RepeatFrom.Iterator}} in {{renderRepeatFromName .RepeatFrom.Name}}"{{end}}>{{end}}<{{.As}} {{if .Bindings.Class.FromStateName}}:class="{{renderClassBinding .Bindings}}"{{end}} {{if or .Bindings.Show.FromStateName .Bindings.Hide.FromStateName}}x-show="{{renderBindings .Bindings}}"{{end}} id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}" {{if .VisibleAnimation.AnimationName}}x-intersect-class{{if .VisibleAnimation.Once}}.once{{end}}="animate__animated animate__{{.VisibleAnimation.AnimationName}}"{{end}} {{range $index, $event := .Events}}x-on:{{$event.Kind}}="{{$event.Id}}($event)" {{end}} {{if .RepeatFrom.Name}}:key="index"{{end}}>{{.RenderedChildren}}</{{.As}}>{{if .RepeatFrom.Iterator}}</template>{{end}}`

func convertColumns(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	funcMap := template.FuncMap{
		"renderClassBinding":   RenderClassBinding,
		"renderBindings":       RenderShowHideBindings,
		"renderRepeatFromName": renderRepeatFromName,
	}
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var columns Columns
	json.Unmarshal(b, &columns)

	// Render the children of this component
	var renderedChildren []string
	for _, child := range columns.Components {
		renderedChild, err := convertComponentToHTML(child.(map[string]interface{}), styleStore, functionStore)
		if err != nil {
			fmt.Println("error:", err.Error())
			return "", err
		}
		renderedChildren = append(renderedChildren, renderedChild)
	}

	visibleAnimation, events := PullVisibleAnimation(columns.Events)
	columns.Events = events

	as := "div"
	if columns.Data.As != "" {
		as = columns.Data.As
	}

	params := struct {
		RenderedChildren string
		Id               string
		ElementId        string
		Bindings         Bindings
		RepeatFrom       struct {
			Name     string
			Iterator string
		}
		Events     []Event
		ClassNames []string
		VisibleAnimation
		As string
	}{
		RenderedChildren: strings.Join(renderedChildren, "\n"),
		Id:               columns.Id,
		ElementId:        columns.ElementId,
		Bindings:         columns.Bindings,
		RepeatFrom:       columns.RepeatFrom,
		Events:           columns.Events,
		ClassNames:       columns.ClassNames,
		VisibleAnimation: visibleAnimation,
		As:               as,
	}

	// Render the component and its children
	tmpl, err := template.New("columns").Funcs(funcMap).Parse(columnsTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	fmt.Println(out.String())

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(columns.Events)

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(columns.Id, columns.Data.Style.Desktop, columns.Data.Style.Tablet, columns.Data.Style.Mobile)

	return out.String(), nil
}
