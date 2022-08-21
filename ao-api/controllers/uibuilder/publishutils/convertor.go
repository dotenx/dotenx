package publishutils

import (
	"bytes"
	"fmt"
	"strings"
	"text/template"
)

type Page struct {
	Name string
	Head struct {
		Title string
		Meta  []struct {
			Name    string
			Content string
		}
		Scripts []string
	}
	Body struct {
		Content string
	}
}

var pageTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
	<title>{{.Head.Title}}</title>
	{{range .Head.Meta}}
	<meta name="{{.Name}}" content="{{.Content}}">
	{{end}}
	<script  src="https://unpkg.com/@alpinejs/persist@3.10.3/dist/cdn.min.js"></script>
	<script src="https://unpkg.com/alpinejs@3.10.3/dist/cdn.min.js" defer></script>
	<link rel="stylesheet" href="./{{.Name}}.css">
</head>
<body x-data>
	{{.Body.Content}}
	<script src="./{{.Name}}.js"></script>
</body>
</html>
`

func convertToHTML(page map[string]interface{}) (renderedPage, renderedScripts, renderStyles string, err error) {
	styleStore := NewStyleStore()
	functionStore := NewFunctionStore()

	code, err := convertBodyToHTML(page["layout"].([]interface{}), &styleStore, &functionStore)
	if err != nil {
		return "", "", "", err
	}

	p := Page{
		Name: page["name"].(string),
		Head: struct {
			Title string
			Meta  []struct {
				Name    string
				Content string
			}
			Scripts []string
		}{
			Title:   page["title"].(string),
			Meta:    nil,
			Scripts: []string{},
		},
		Body: struct {
			Content string
		}{
			Content: code,
		},
	}

	tmpl, err := template.New("button").Parse(pageTemplate)
	if err != nil {
		fmt.Println(err)
		return "", "", "", err
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, p)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", "", "", err
	}

	scripts, err := functionStore.ConvertToHTML(page["dataSources"].([]interface{}))
	if err != nil {
		return "", "", "", err
	}
	styles, err := styleStore.ConvertToHTML()
	if err != nil {
		return "", "", "", err
	}

	return out.String(), scripts, styles, nil
}

func convertBodyToHTML(components []interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {

	// Convert each step to code and append to the code string using string builder
	var sb strings.Builder

	for _, component := range components {
		code, _ := convertComponentToHTML(component.(map[string]interface{}), styleStore, functionStore)
		sb.WriteString(code + "\n")
	}

	return sb.String(), nil
}

func convertComponentToHTML(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	fmt.Printf("kind: %#v\n", component["kind"])

	switch component["kind"] {
	case "Box":
		return convertBox(component, styleStore, functionStore)
	case "Columns":
		return convertColumns(component, styleStore, functionStore)
	case "Input":
		return convertInput(component, styleStore, functionStore)
	case "Button":
		return convertButton(component, styleStore, functionStore)
	case "SubmitButton":
		return convertSubmitButton(component, styleStore, functionStore)
	case "Textarea":
		return convertTextArea(component, styleStore, functionStore)
	case "Text":
		return convertText(component, styleStore, functionStore)
	case "Image":
		return convertImage(component, styleStore, functionStore)
	case "Select":
		return convertSelect(component, styleStore, functionStore)
	default:
		return "", fmt.Errorf("Unknown component type: %s", component["kind"])
	}
}
