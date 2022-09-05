package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type SubmitButton struct {
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
		Text string `json:"text"`
	} `json:"data"`
}

const submitButtonTemplate = `<button type="submit" id="{{.Id}}" class="{{range .ClassNames}}{{.}} {{end}}">{{.Data.Text}}</button>`

func convertSubmitButton(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var button SubmitButton
	json.Unmarshal(b, &button)
	tmpl, err := template.New("button").Parse(submitButtonTemplate)
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
