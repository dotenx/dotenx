package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"
)

type Link struct {
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
		CustomStyle struct {
			Desktop map[string]map[string]string `json:"desktop"`
			Tablet  map[string]map[string]string `json:"tablet"`
			Mobile  map[string]map[string]string `json:"mobile"`
		} `json:"customStyle"`
		Href struct {
			Value []TextSource
		} `json:"href"`
		OpenInNewTab bool `json:"openInNewTab"`
	} `json:"data"`
}

const linkTemplate = `{{if .RepeatFrom.Iterator}}<template {{if .RepeatFrom.Name}}x-for="({{.RepeatFrom.Iterator}}, index) in {{renderRepeatFromName .RepeatFrom.Name}}"{{end}}>{{end}}<a {{if .Bindings.Class.FromStateName}}:class="{{renderClassBinding .Bindings}}"{{end}} {{if or .Bindings.Show.FromStateName .Bindings.Hide.FromStateName}}x-show="{{renderBindings .Bindings}}"{{end}} href="{{range .Href.Value}}{{renderTextSource .}}{{end}}" {{if .OpenInNewTab}}target="blank"{{end}} id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}" {{renderEvents .Events}} {{if .RepeatFrom.Name}}:key="index"{{end}}>{{.RenderedChildren}}</a>{{if .RepeatFrom.Iterator}}</template>{{end}}`

func convertLink(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {

	funcMap := template.FuncMap{
		"renderTextSource":     renderTextSource,
		"renderRepeatFromName": renderRepeatFromName,
		"renderClassBinding":   RenderClassBinding,
		"renderBindings":       RenderShowHideBindings,
		"renderEvents":         renderEvents,
	}

	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var link Link
	json.Unmarshal(b, &link)
	tmpl, err := template.New("link").Funcs(funcMap).Parse(linkTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var renderedChildren []string

	for _, child := range link.Components {
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
		Href       struct {
			Value []TextSource
		}
		OpenInNewTab bool
	}{
		RenderedChildren: strings.Join(renderedChildren, "\n"),
		Id:               link.Id,
		ElementId:        link.ElementId,
		Bindings:         link.Bindings,
		RepeatFrom:       link.RepeatFrom,
		Events:           link.Events,
		ClassNames:       link.ClassNames,
		Href:             link.Data.Href,
		OpenInNewTab:     link.Data.OpenInNewTab,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(link.Events)

	// Add the styles to the styleStore to be rendered later
	id := link.Id
	if link.ElementId != "" {
		id = link.ElementId
	}
	styleStore.AddStyle(id, link.Data.Style.Desktop, link.Data.Style.Tablet, link.Data.Style.Mobile)
	styleStore.AddCustomStyle(id, link.Data.CustomStyle.Desktop, link.Data.CustomStyle.Tablet, link.Data.CustomStyle.Mobile)

	return out.String(), nil
}
