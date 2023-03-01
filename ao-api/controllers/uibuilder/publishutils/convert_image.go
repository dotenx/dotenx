package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type Image struct {
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
		CustomStyle struct {
			Desktop map[string]map[string]string `json:"desktop"`
			Tablet  map[string]map[string]string `json:"tablet"`
			Mobile  map[string]map[string]string `json:"mobile"`
		} `json:"customStyle"`
		Alt string `json:"alt"`
		Src struct {
			Value []TextSource `json:"value"`
		} `json:"src"`
	} `json:"data"`
}

const imageTemplate = `{{if .RepeatFrom.Name}}<template x-for="({{.RepeatFrom.Iterator}}, index) in {{renderRepeatFromName .RepeatFrom.Name}}">{{end}}<img {{if .Bindings.Class.FromStateName}}:class="{{renderClassBinding .Bindings}}"{{end}} {{if or .Bindings.Show.FromStateName .Bindings.Hide.FromStateName}}x-show="{{renderBindings .Bindings}}"{{end}}  {{renderEvents .Events}} {{if .RepeatFrom.Name}}:key="index"{{end}} id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}" alt="{{.Data.Alt}}" x-bind:src="` + "`{{range .Data.Src.Value}}{{renderTextSource .}}{{end}}`" + `" />{{if .RepeatFrom.Name}}</template>{{end}}`

func convertImage(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {

	funcMap := template.FuncMap{
		"renderTextSource":     renderTextSource,
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
	var image Image
	json.Unmarshal(b, &image)
	tmpl, err := template.New("image").Funcs(funcMap).Parse(imageTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	params := struct {
		Image
	}{
		image,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(image.Events)

	// Add the styles to the styleStore to be rendered later
	id := image.Id
	if image.ElementId != "" {
		id = image.ElementId
	}
	styleStore.AddStyle(id, image.Data.Style.Desktop, image.Data.Style.Tablet, image.Data.Style.Mobile)
	styleStore.AddCustomStyle(id, image.Data.CustomStyle.Desktop, image.Data.CustomStyle.Tablet, image.Data.CustomStyle.Mobile)

	return out.String(), nil
}
