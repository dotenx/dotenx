package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"
)

type Columns struct {
	kind       string        `json:"type"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
	Data       struct {
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
	} `json:"data"`
}

const columnsTemplate = `<div id="{{.Id}}" class="dtx-{{.Id}}">{{.RenderedChildren}}</div>`

func convertColumns(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var columns Columns
	json.Unmarshal(b, &columns)

	// Render the children of this component
	var renderedChildren []string
	for _, child := range columns.Components {
		renderedChild, err := convertComponentToHTML(child.(map[string]interface{}), styleStore, functionStore)
		if err != nil {
			fmt.Println("error:", err.Error())
			return "", err
		}
		renderedChildren = append(renderedChildren, renderedChild)
	}

	params := struct {
		RenderedChildren string
		Id               string
	}{
		RenderedChildren: strings.Join(renderedChildren, "\n"),
		Id:               columns.Id,
	}

	// Render the component and its children
	tmpl, err := template.New("columns").Parse(columnsTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	fmt.Println(out.String())

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(columns.Id, columns.Data.Style.Desktop, columns.Data.Style.Tablet, columns.Data.Style.Mobile)

	return out.String(), nil
}
