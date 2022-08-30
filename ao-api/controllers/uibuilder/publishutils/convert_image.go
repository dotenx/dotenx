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
	RepeatFrom struct {
		Name     string
		Iterator string
	} `json:"repeatFrom"`
	Data struct {
		Style struct {
			Desktop map[string]string `json:"desktop"`
			Tablet  map[string]string `json:"tablet"`
			Mobile  map[string]string `json:"mobile"`
		} `json:"style"`
		Alt string `json:"alt"`
		Src string `json:"src"`
	} `json:"data"`
}

const imageTemplate = `{{if .RepeatFrom.Name}}<template x-for="(index, {{.RepeatFrom.Iterator}}) in {{.RepeatFrom.Name}}">{{end}}<img {{range $index, $event := .Events}}x-on:{{$event.Kind}}="{{$event.Id}}()" {{end}} {{if .RepeatFrom.Name}}:key="index"{{end}} id="{{.Id}}" alt="{{.Data.Alt}}" x-bind:src="` + "`{{.Data.Src}}`" + `" />{{if .RepeatFrom.Name}}</template>{{end}}`

func convertImage(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var image Image
	json.Unmarshal(b, &image)
	tmpl, err := template.New("image").Parse(imageTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, image)
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
