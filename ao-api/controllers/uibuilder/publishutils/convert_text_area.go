package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type TextArea struct {
	kind       string        `json:"kind"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
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
		DefaultValue string `json:"defaultValue"`
		Name         string `json:"name"`
		Placeholder  string `json:"placeholder"`
		Required     bool   `json:"required"`
		Type         string `json:"type"`
		Value        string `json:"value"`
		Rows         string `json:"rows"`
		Cols         string `json:"cols"`
	} `json:"data"`
}

const textAreaTemplate = `<textarea cols="{{.Data.Cols}}" rows="{{.Data.Rows}}" id="{{.Id}}" class="{{range .ClassNames}}{{.}} {{end}}" placeholder="{{.Data.Placeholder}}" x-model="formData.{{.Data.Name}}" {{if .Data.DefaultValue}} x-init="formData.{{.Data.Name}}='{{.Data.DefaultValue}}'" {{end}}></textarea>`

func convertTextArea(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var textArea TextArea
	json.Unmarshal(b, &textArea)
	tmpl, err := template.New("textArea").Parse(textAreaTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, textArea)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(textArea.Id, textArea.Data.Style.Desktop, textArea.Data.Style.Tablet, textArea.Data.Style.Mobile)

	return out.String(), nil
}
