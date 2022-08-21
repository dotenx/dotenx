package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type Image struct {
	kind       string        `json:"type"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
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
		Image struct {
			Path string `json:"path"`
		} `json:"image"`
		AltText string `json:"altText"`
	} `json:"data"`
}

const imageTemplate = `{{if .RepeatFrom.Name}}<template x-for="(index, {{.RepeatFrom.Iterator}}) in {{.RepeatFrom.Name}}">{{end}}<img {{if .RepeatFrom.Name}}:key="index"{{end}} id="{{.Id}}" alt="{{.Data.AltText}}" x-bind:src="` + "`{{.Data.Image.Path}}`" + `" />{{if .RepeatFrom.Name}}</template>{{end}}`

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

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(image.Id, image.Data.Style.Desktop, image.Data.Style.Tablet, image.Data.Style.Mobile)

	return out.String(), nil
}
