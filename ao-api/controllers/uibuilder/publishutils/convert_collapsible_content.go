package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"
)

type CollapsibleContent struct {
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
	} `json:"data"`
}

const collapsibleContentTemplate = `{{if .RepeatFrom.Iterator}}<template {{if .RepeatFrom.Name}}x-for="(index, {{.RepeatFrom.Iterator}}) in {{renderRepeatFromName .RepeatFrom.Name}}"{{end}}>{{end}}<div {{if .Bindings.Show.FromStateName}}x-show="{{renderBindings .Bindings}}"{{end}} id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}" {{if .VisibleAnimation.AnimationName}}x-intersect-class{{if .VisibleAnimation.Once}}.once{{end}}="animate__animated animate__{{.VisibleAnimation.AnimationName}}"{{end}}  {{range $index, $event := .Events}}x-on:{{$event.Kind}}="{{$event.Id}}($event)"{{if eq $event.Kind "load"}}x-init={$nextTick(() => {{$event.Id}}())} {{end}}" {{end}} {{if .RepeatFrom.Name}}:key="index"{{end}} x-show='toggle? active == $el.parentElement.id : isOpen[$el.parentElement.id]' x-transition:enter.duration.500ms>{{.RenderedChildren}}</div>{{if .RepeatFrom.Iterator}}</template>{{end}}`

func convertCollapsibleContent(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	funcMap := template.FuncMap{
		"renderBindings":       RenderBindings,
		"renderRepeatFromName": renderRepeatFromName,
	}
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var collapsibleContent CollapsibleContent
	json.Unmarshal(b, &collapsibleContent)
	tmpl, err := template.New("collapsibleContent").Funcs(funcMap).Parse(collapsibleContentTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	visibleAnimation, events := PullVisibleAnimation(collapsibleContent.Events)
	collapsibleContent.Events = events

	var renderedChildren []string

	for _, child := range collapsibleContent.Components {
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
		VisibleAnimation
	}{
		RenderedChildren: strings.Join(renderedChildren, "\n"),
		Id:               collapsibleContent.Id,
		ElementId:        collapsibleContent.ElementId,
		Bindings:         collapsibleContent.Bindings,
		RepeatFrom:       collapsibleContent.RepeatFrom,
		Events:           collapsibleContent.Events,
		ClassNames:       collapsibleContent.ClassNames,
		VisibleAnimation: visibleAnimation,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(collapsibleContent.Events)

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(collapsibleContent.Id, collapsibleContent.Data.Style.Desktop, collapsibleContent.Data.Style.Tablet, collapsibleContent.Data.Style.Mobile)

	return out.String(), nil
}
