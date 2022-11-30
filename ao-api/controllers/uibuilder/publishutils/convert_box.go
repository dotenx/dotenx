package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"
)

type Box struct {
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
	Data       struct {
		Style struct {
			Desktop StyleModes `json:"desktop"`
			Tablet  StyleModes `json:"tablet"`
			Mobile  StyleModes `json:"mobile"`
		} `json:"style"`
		Name string `json:"name"`
	} `json:"data"`
}

const boxTemplate = `{{if .RepeatFrom.Iterator}}<template x-show="!{{.RepeatFrom.Name}}.isLoading" {{if .RepeatFrom.Name}}x-for="(index, {{.RepeatFrom.Iterator}}) in {{.RepeatFrom.Name}}"{{end}}>{{end}}<div id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}" {{if .VisibleAnimation.AnimationName}}x-intersect-class{{if .VisibleAnimation.Once}}.once{{end}}="animate__animated animate__{{.VisibleAnimation.AnimationName}}"{{end}}  {{range $index, $event := .Events}}x-on:{{$event.Kind}}="{{$event.Id}}"{{if eq $event.Kind "load"}}x-init={$nextTick(() => {{$event.Id}}())} {{end}}" {{end}} {{if .RepeatFrom.Name}}:key="index"{{end}}>{{.RenderedChildren}}</div>{{if .RepeatFrom.Iterator}}</template>{{end}}`

func convertBox(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var box Box
	json.Unmarshal(b, &box)
	tmpl, err := template.New("box").Parse(boxTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	visibleAnimation, events := PullVisibleAnimation(box.Events)
	box.Events = events

	var renderedChildren []string

	for _, child := range box.Components {
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
		RepeatFrom       struct {
			Name     string
			Iterator string
		}
		Events     []Event
		ClassNames []string
		VisibleAnimation
	}{
		RenderedChildren: strings.Join(renderedChildren, "\n"),
		Id:               box.Id,
		ElementId:        box.ElementId,
		RepeatFrom:       box.RepeatFrom,
		Events:           box.Events,
		ClassNames:       box.ClassNames,
		VisibleAnimation: visibleAnimation,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(box.Events)

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(box.Id, box.Data.Style.Desktop, box.Data.Style.Tablet, box.Data.Style.Mobile)

	return out.String(), nil
}

type VisibleAnimation struct {
	AnimationName string
	Once          bool
}

func PullVisibleAnimation(events []Event) (VisibleAnimation, []Event) {
	// Note: if user chooses visible and visibleOnce, one of them will be ignored (ideally UI should prevent this)
	visibleAnimation := VisibleAnimation{}
	var newEvents []Event
	for _, event := range events {
		if event.Kind == "visible" { // Important: Only for visible and visibleOnce events we accept one and only one action which is an animation too
			visibleAnimation.AnimationName = event.Actions[0].AnimationName
			visibleAnimation.Once = false
		} else if event.Kind == "visibleOnce" {
			visibleAnimation.AnimationName = event.Actions[0].AnimationName
			visibleAnimation.Once = true
		} else {
			newEvents = append(newEvents, event)
		}
	}
	return visibleAnimation, newEvents
}
