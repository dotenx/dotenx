package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type Slider struct {
	Kind       string        `json:"kind"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
	Events     []Event       `json:"events"`
	ClassNames []string      `json:"classNames"`
	ElementId  string        `json:"elementId"`
	Bindings   Bindings      `json:"bindings"`
	Data       struct {
		Style struct {
			Desktop StyleModes `json:"desktop"`
			Tablet  StyleModes `json:"tablet"`
			Mobile  StyleModes `json:"mobile"`
		} `json:"style"`
		Name string `json:"name"`
	} `json:"data"`
}

const sliderTemplate = `<div {{if .Bindings.Class.FromStateName}}:class="{{renderClassBinding .Bindings}}"{{end}} {{if or .Bindings.Show.FromStateName .Bindings.Hide.FromStateName}}x-show="{{renderBindings .Bindings}}"{{end}} id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="splide {{range .ClassNames}}{{.}} {{end}}" 
 
{{renderEvents .Events}} 
>
<div class="splide__track">
<div class="splide__list">
{{range .RenderedChildren}}
<div class="splide__slide">
{{.}}
</div>
{{end}}
</div>
</div>
</div>`

func convertSlider(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	funcMap := template.FuncMap{
		"renderClassBinding": RenderClassBinding,
		"renderEvents":       renderEvents,
		"renderBindings":     RenderShowHideBindings,
	}
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var slider Slider
	json.Unmarshal(b, &slider)
	tmpl, err := template.New("slider").Funcs(funcMap).Parse(sliderTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var renderedChildren []string

	for _, child := range slider.Components {
		renderedChild, err := convertComponentToHTML(child.(map[string]interface{}), styleStore, functionStore)
		if err != nil {
			fmt.Println(err)
			return "", err
		}
		renderedChildren = append(renderedChildren, renderedChild)
	}

	params := struct {
		RenderedChildren []string
		Id               string
		ElementId        string
		Bindings         Bindings
		Events           []Event
		ClassNames       []string
		VisibleAnimation
	}{
		RenderedChildren: renderedChildren,
		Id:               slider.Id,
		ElementId:        slider.ElementId,
		Bindings:         slider.Bindings,
		Events:           slider.Events,
		ClassNames:       slider.ClassNames,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(slider.Events)

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(slider.Id, slider.Data.Style.Desktop, slider.Data.Style.Tablet, slider.Data.Style.Mobile)

	return out.String(), nil
}
