package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type Button struct {
	kind       string        `json:"kind"`
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
		Text string `json:"text"`
	} `json:"data"`
}

const buttonTemplate = `{{if .RepeatFrom.Name}}<template x-for="(index, {{.RepeatFrom.Iterator}}) in {{.RepeatFrom.Name}}">{{end}}<button {{if .RepeatFrom.Name}}:key="index"{{end}} id="{{.Id}}">{{.Data.Text}}</button>{{if .RepeatFrom.Name}}</template>{{end}}`

func convertButton(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var button Button
	json.Unmarshal(b, &button)
	tmpl, err := template.New("button").Parse(buttonTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, button)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(button.Id, button.Data.Style.Desktop, button.Data.Style.Tablet, button.Data.Style.Mobile)

	return out.String(), nil
}
