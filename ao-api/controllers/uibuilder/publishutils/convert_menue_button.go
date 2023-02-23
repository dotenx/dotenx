package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"
)

type MenuButton struct {
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
		MenuId string `json:"menuId"` // This is not even used
	} `json:"data"`
}

const menuButtonTemplate = `<button @click='isOpen = !isOpen' id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}"   {{renderEvents .Events}} {{if .RepeatFrom.Name}}:key="index"{{end}}>{{.RenderedChildren}}</button>`

func convertMenuButton(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	funcMap := template.FuncMap{
		"renderEvents": renderEvents,
	}
	var menuButton MenuButton
	json.Unmarshal(b, &menuButton)
	tmpl, err := template.New("menuButton").Funcs(funcMap).Parse(menuButtonTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var renderedChildren []string

	for _, child := range menuButton.Components {
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
		Id:               menuButton.Id,
		ElementId:        menuButton.ElementId,
		RepeatFrom:       menuButton.RepeatFrom,
		Events:           menuButton.Events,
		ClassNames:       menuButton.ClassNames,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(menuButton.Events)

	// Add the styles to the styleStore to be rendered later
	id := menuButton.Id
	if menuButton.ElementId != "" {
		id = menuButton.ElementId
	}
	styleStore.AddStyle(id, menuButton.Data.Style.Desktop, menuButton.Data.Style.Tablet, menuButton.Data.Style.Mobile)

	return out.String(), nil
}
