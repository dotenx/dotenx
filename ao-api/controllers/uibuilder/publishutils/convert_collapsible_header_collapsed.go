package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"
)

type CollapsibleHeaderCollapsed struct {
	Kind       string        `json:"kind"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
	RepeatFrom struct {
		Name     string
		Iterator string
	} `json:"repeatFrom"`
	Events     []Event  `json:"events"`
	ClassNames []string `json:"classNames"`
	Data       struct {
		Style struct {
			Desktop StyleModes `json:"desktop"`
			Tablet  StyleModes `json:"tablet"`
			Mobile  StyleModes `json:"mobile"`
		} `json:"style"`
	} `json:"data"`
}

const collapsibleHeaderCollapsedTemplate = `{{if .RepeatFrom.Iterator}}<template {{if .RepeatFrom.Name}}x-for="(index, {{.RepeatFrom.Iterator}}) in {{.RepeatFrom.Name}}"{{end}}>{{end}}<div id="{{.Id}}" class="{{range .ClassNames}}{{.}} {{end}}" {{if .VisibleAnimation.AnimationName}}x-intersect-class{{if .VisibleAnimation.Once}}.once{{end}}="animate__animated animate__{{.VisibleAnimation.AnimationName}}"{{end}}  {{range $index, $event := .Events}}x-on:{{$event.Kind}}="{{$event.Id}}"{{if eq $event.Kind "load"}}x-init={$nextTick(() => {{$event.Id}}())} {{end}}" {{end}} {{if .RepeatFrom.Name}}:key="index"{{end}} x-show='toggle ? active == $el.parentElement.id : isOpen[$el.parentElement.id]' @click='toggle ? active = -1 : isOpen[$el.parentElement.id] = false'>{{.RenderedChildren}}</div>{{if .RepeatFrom.Iterator}}</template>{{end}}`

func convertCollapsibleHeaderCollapsed(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var collapsibleHeaderCollapsed CollapsibleHeaderCollapsed
	json.Unmarshal(b, &collapsibleHeaderCollapsed)
	tmpl, err := template.New("collapsibleHeaderCollapsed").Parse(collapsibleHeaderCollapsedTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	visibleAnimation, events := PullVisibleAnimation(collapsibleHeaderCollapsed.Events)
	collapsibleHeaderCollapsed.Events = events

	var renderedChildren []string

	for _, child := range collapsibleHeaderCollapsed.Components {
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
		RepeatFrom       struct {
			Name     string
			Iterator string
		}
		Events     []Event
		ClassNames []string
		VisibleAnimation
	}{
		RenderedChildren: strings.Join(renderedChildren, "\n"),
		Id:               collapsibleHeaderCollapsed.Id,
		RepeatFrom:       collapsibleHeaderCollapsed.RepeatFrom,
		Events:           collapsibleHeaderCollapsed.Events,
		ClassNames:       collapsibleHeaderCollapsed.ClassNames,
		VisibleAnimation: visibleAnimation,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(collapsibleHeaderCollapsed.Events)

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(collapsibleHeaderCollapsed.Id, collapsibleHeaderCollapsed.Data.Style.Desktop, collapsibleHeaderCollapsed.Data.Style.Tablet, collapsibleHeaderCollapsed.Data.Style.Mobile)

	return out.String(), nil
}
