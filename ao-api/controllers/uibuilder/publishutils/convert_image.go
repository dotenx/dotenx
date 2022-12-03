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
		Alt string `json:"alt"`
		Src struct {
			Value []TextSource `json:"value"`
		} `json:"src"`
	} `json:"data"`
}

const imageTemplate = `{{if .RepeatFrom.Name}}<template x-for="(index, {{.RepeatFrom.Iterator}}) in {{.RepeatFrom.Name}}">{{end}}<img x-show="{{renderBindings .Bindings}}" {{if .VisibleAnimation.AnimationName}}x-intersect-class{{if .VisibleAnimation.Once}}.once{{end}}="animate__animated animate__{{.VisibleAnimation.AnimationName}}"{{end}} {{range $index, $event := .Events}}x-on:{{$event.Kind}}="{{$event.Id}}($event)" {{end}} {{if .RepeatFrom.Name}}:key="index"{{end}} id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}" alt="{{.Data.Alt}}" x-bind:src="` + "`{{range .Data.Src.Value}}{{renderTextSource .}}{{end}}`" + `" />{{if .RepeatFrom.Name}}</template>{{end}}`

func convertImage(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {

	funcMap := template.FuncMap{
		"renderTextSource": renderTextSource,
		"renderBindings":   RenderBindings,
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

	visibleAnimation, events := PullVisibleAnimation(image.Events)
	image.Events = events

	params := struct {
		Image
		VisibleAnimation VisibleAnimation
	}{
		image,
		visibleAnimation,
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
	styleStore.AddStyle(image.Id, image.Data.Style.Desktop, image.Data.Style.Tablet, image.Data.Style.Mobile)

	return out.String(), nil
}
