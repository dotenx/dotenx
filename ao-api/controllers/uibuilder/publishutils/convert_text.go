package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type Text struct {
	Kind       string        `json:"type"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
	Events     []Event       `json:"events"`
	RepeatFrom struct {
		Name     string
		Iterator string
	} `json:"repeatFrom"`
	ClassNames []string `json:"classNames"`
	Data       struct {
		Style struct {
			Desktop StyleModes `json:"desktop"`
			Tablet  StyleModes `json:"tablet"`
			Mobile  StyleModes `json:"mobile"`
		} `json:"style"`
		Text string `json:"text"`
	} `json:"data"`
}

// TODO: id in templates rendered with RepeatFrom won't work! Do something about it

const textTemplate = `{{if .RepeatFrom.Name}}<template x-for="(index, {{.RepeatFrom.Iterator}}) in {{.RepeatFrom.Name}}">{{end}}<div {{range $index, $event := .Events}}x-on:{{$event.Kind}}="{{$event.Id}}()" {{end}} {{if .RepeatFrom.Name}}:key="index"{{end}} id="{{.Id}}" class="{{range .ClassNames}}{{.}} {{end}}" display="inline" x-html='` + "`{{.Data.Text}}`" + `'></div>{{if .RepeatFrom.Name}}</template>{{end}}`

func convertText(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var text Text
	json.Unmarshal(b, &text)
	// fmt.Printf("%#v\n", text)
	tmpl, err := template.New("text").Parse(textTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, text)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(text.Events)

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(text.Id, text.Data.Style.Desktop, text.Data.Style.Tablet, text.Data.Style.Mobile)

	return out.String(), nil
}
