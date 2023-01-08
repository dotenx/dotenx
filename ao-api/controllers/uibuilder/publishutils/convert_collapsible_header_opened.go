package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"
)

// Doesn't support bindings
type CollapsibleHeaderOpened struct {
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
	} `json:"data"`
}

const collapsibleHeaderOpenedTemplate = `{{if .RepeatFrom.Iterator}}<template {{if .RepeatFrom.Name}}x-for="({{.RepeatFrom.Iterator}}, index) in {{renderRepeatFromName .RepeatFrom.Name}}"{{end}}>{{end}}<div id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}"   {{renderEvents .Events}} {{if .RepeatFrom.Name}}:key="index"{{end}} x-show='toggle ? active != $el.parentElement.id : !isOpen[$el.parentElement.id]' @click='toggle ? active = $el.parentElement.id : isOpen[$el.parentElement.id] = true'>{{.RenderedChildren}}</div>{{if .RepeatFrom.Iterator}}</template>{{end}}`

func convertCollapsibleHeaderOpened(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	funcMap := template.FuncMap{
		"renderRepeatFromName": renderRepeatFromName,
	}
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var collapsibleHeaderOpened CollapsibleHeaderOpened
	json.Unmarshal(b, &collapsibleHeaderOpened)
	tmpl, err := template.New("collapsibleHeaderOpened").Funcs(funcMap).Parse(collapsibleHeaderOpenedTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var renderedChildren []string

	for _, child := range collapsibleHeaderOpened.Components {
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
		Id:               collapsibleHeaderOpened.Id,
		ElementId:        collapsibleHeaderOpened.ElementId,
		RepeatFrom:       collapsibleHeaderOpened.RepeatFrom,
		Events:           collapsibleHeaderOpened.Events,
		ClassNames:       collapsibleHeaderOpened.ClassNames,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(collapsibleHeaderOpened.Events)

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(collapsibleHeaderOpened.Id, collapsibleHeaderOpened.Data.Style.Desktop, collapsibleHeaderOpened.Data.Style.Tablet, collapsibleHeaderOpened.Data.Style.Mobile)

	return out.String(), nil
}
