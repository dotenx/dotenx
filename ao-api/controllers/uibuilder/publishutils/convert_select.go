package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type Select struct {
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
		DefaultValue string `json:"defaultValue"`
		Name         string `json:"name"`
		Placeholder  string `json:"placeholder"`
		Required     bool   `json:"required"`
		Type         string `json:"type"`
		Value        string `json:"value"`
		Options      []struct {
			Label string `json:"label"`
			Value string `json:"value"`
		} `json:"options"`
	} `json:"data"`
}

const selectTemplate = `<select id="{{.Id}}" display="inline" value="{{.Data.Value}}">{{range .Data.Options}}<option value="{{.Value}}">{{.Label}}</option>{{end}}</select>`

func convertSelect(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var sel Select
	json.Unmarshal(b, &sel)
	// fmt.Printf("%#v\n", sel)
	tmpl, err := template.New("sel").Parse(selectTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, sel)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(sel.Id, sel.Data.Style.Desktop, sel.Data.Style.Tablet, sel.Data.Style.Mobile)

	return out.String(), nil
}
