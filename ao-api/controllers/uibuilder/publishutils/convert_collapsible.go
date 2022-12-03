package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"
)

type Collapsible struct {
	Kind       string        `json:"kind"`
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
		IsToggle bool `json:"isToggle"`
	} `json:"data"`
}

const collapsibleTemplate = `{{if .RepeatFrom.Iterator}}<template {{if .RepeatFrom.Name}}x-for="(index, {{.RepeatFrom.Iterator}}) in {{.RepeatFrom.Name}}"{{end}}>{{end}}<div x-show="{{renderBindings .Bindings}}" id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}" {{if .VisibleAnimation.AnimationName}}x-intersect-class{{if .VisibleAnimation.Once}}.once{{end}}="animate__animated animate__{{.VisibleAnimation.AnimationName}}"{{end}}  {{range $index, $event := .Events}}x-on:{{$event.Kind}}="{{$event.Id}}"{{if eq $event.Kind "load"}}x-init={$nextTick(() => {{$event.Id}}())} {{end}}" {{end}} {{if .RepeatFrom.Name}}:key="index"{{end}} x-data="{active: -1, toggle: {{.IsToggle}}, isOpen:{}}">{{.RenderedChildren}}</div>{{if .RepeatFrom.Iterator}}</template>{{end}}`

func convertCollapsible(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	funcMap := template.FuncMap{
		"renderBindings": RenderBindings,
	}
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var collapsible Collapsible
	json.Unmarshal(b, &collapsible)
	tmpl, err := template.New("collapsible").Funcs(funcMap).Parse(collapsibleTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	visibleAnimation, events := PullVisibleAnimation(collapsible.Events)
	collapsible.Events = events

	var renderedChildren []string

	for _, child := range collapsible.Components {
		renderedChild, err := convertComponentToHTML(child.(map[string]interface{}), styleStore, functionStore)
		if err != nil {
			fmt.Println(err)
			return "", err
		}
		renderedChildren = append(renderedChildren, renderedChild)
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
		IsToggle   bool
		VisibleAnimation
	}{
		RenderedChildren: strings.Join(renderedChildren, "\n"),
		Id:               collapsible.Id,
		ElementId:        collapsible.ElementId,
		Bindings:         collapsible.Bindings,
		RepeatFrom:       collapsible.RepeatFrom,
		Events:           collapsible.Events,
		ClassNames:       collapsible.ClassNames,
		VisibleAnimation: visibleAnimation,
		IsToggle:         collapsible.Data.IsToggle,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(collapsible.Events)

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(collapsible.Id, collapsible.Data.Style.Desktop, collapsible.Data.Style.Tablet, collapsible.Data.Style.Mobile)

	return out.String(), nil
}
