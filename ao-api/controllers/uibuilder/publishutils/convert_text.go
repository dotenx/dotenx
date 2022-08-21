package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type Text struct {
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
		Text string `json:"text"`
	} `json:"data"`
}

const textTemplate = `{{if .RepeatFrom.Name}}<template x-for="(index, {{.RepeatFrom.Iterator}}) in {{.RepeatFrom.Name}}">{{end}}<div {{if .RepeatFrom.Name}}:key="index"{{end}} id="{{.Id}}" display="inline" x-html=` + "`{{.Data.Text}}`" + `></div>{{if .RepeatFrom.Name}}</template>{{end}}`

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

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(text.Id, text.Data.Style.Desktop, text.Data.Style.Tablet, text.Data.Style.Mobile)

	return out.String(), nil
}
