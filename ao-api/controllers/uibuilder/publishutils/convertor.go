package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"

	"github.com/sirupsen/logrus"
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
	CustomCodes struct {
		Head   string
		Footer string
	}
	Fonts string
}

var pageTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
	<title>{{.Head.Title}}</title>
	{{range .Head.Meta}}
	<meta name="{{.Name}}" content="{{.Content}}">
	{{end}}
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" />
	<script  src="https://unpkg.com/alpinejs-intersect-class@1.x.x/dist/cdn.min.js"></script>
	<script src="https://unpkg.com/@alpinejs/intersect@3.10.5/dist/cdn.min.js"></script>
	<script  src="https://unpkg.com/@alpinejs/persist@3.10.3/dist/cdn.min.js"></script>
	<script src="https://unpkg.com/alpinejs@3.10.3/dist/cdn.min.js" defer></script>

	<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
	<link href="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.0.17/dist/css/splide.min.css" rel="stylesheet">
	<script src="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.0.17/dist/js/splide.min.js"></script>

	<script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels"></script>
	<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation"></script>
	<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom"></script>
	<link rel="stylesheet" href="./{{.Name}}.css">
	<meta name="viewport" content="width=device-width,initial-scale=1">
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
  />

	<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
	{{if .Fonts}}{{.Fonts}}{{end}}
	{{if .CustomCodes.Head}}{{.CustomCodes.Head}}{{end}}

</head>
<body x-data>
	{{.Body.Content}}
	<script src="./{{.Name}}.js"></script>
	{{if .CustomCodes.Footer}}{{.CustomCodes.Footer}}{{end}}
</body>
</html>
`

func convertToHTML(page map[string]interface{}, name string) (renderedPage, renderedScripts, renderStyles string, err error) {
	styleStore := NewStyleStore()
	functionStore := NewFunctionStore()

	code, err := convertBodyToHTML(page["layout"].([]interface{}), &styleStore, &functionStore)
	if err != nil {
		logrus.Error(err.Error())
		return "", "", "", err
	}

	cc := page["customCodes"].(interface{})

	b, err := json.Marshal(cc)
	if err != nil {
		fmt.Println(err)
		return "", "", "", err
	}

	var customCodes struct {
		Head   string `json:"head"`
		Footer string `json:"footer"`
	}

	err = json.Unmarshal(b, &customCodes)
	if err != nil {
		fmt.Println(err)
		return "", "", "", err
	}

	fonts := "" // This is for backwards compatibility with the pages that don't have the fonts property
	if pageFonts, ok := page["fonts"].(map[string]interface{}); ok {
		fonts, err = convertFonts(pageFonts)
		if err != nil {
			logrus.Error(err.Error())
			return "", "", "", err
		}
	}

	p := Page{
		Name: name,
		Head: struct {
			Title string
			Meta  []struct {
				Name    string
				Content string
			}
			Scripts []string
		}{
			Title:   name, // todo: UI should have a title and use it here
			Meta:    nil,
			Scripts: []string{},
		},
		Body: struct {
			Content string
		}{
			Content: code,
		},
		CustomCodes: struct {
			Head   string
			Footer string
		}{Head: customCodes.Head, Footer: customCodes.Footer},
		Fonts: fonts,
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

	fmt.Println(page)

	// convert page["globals"] to []string

	b, err = json.Marshal(page["globals"])
	if err != nil {
		fmt.Println(err)
		return "", "", "", err
	}

	var globals []string
	err = json.Unmarshal(b, &globals)

	scripts, err := functionStore.ConvertToHTML(page["dataSources"].([]interface{}), globals, page["statesDefaultValues"].(map[string]interface{}))
	if err != nil {
		logrus.Error(err.Error())
		return "", "", "", err
	}
	styles, err := styleStore.ConvertToHTML(page["classNames"].(map[string]interface{}))
	if err != nil {
		logrus.Error(err.Error())
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
	logrus.Info("kind: ", component["kind"])

	switch component["kind"] {
	case "Form":
		return convertForm(component, styleStore, functionStore)
	case "Box":
		fallthrough
	case "Stack":
		fallthrough
	case "Divider":
		return convertBox(component, styleStore, functionStore)
	case "Navbar":
		return convertNavbar(component, styleStore, functionStore)
	case "NavMenu":
		return convertNavMenu(component, styleStore, functionStore)
	case "MenuButton":
		return convertMenuButton(component, styleStore, functionStore)
	case "Link":
		return convertLink(component, styleStore, functionStore)
	case "Columns":
		return convertColumns(component, styleStore, functionStore)
	case "Input":
		return convertInput(component, styleStore, functionStore)
	case "Button":
		return convertButton(component, styleStore, functionStore)
	case "Submit":
		return convertSubmitButton(component, styleStore, functionStore)
	case "Textarea":
		return convertTextArea(component, styleStore, functionStore)
	case "Text":
		return convertText(component, styleStore, functionStore)
	case "Image":
		return convertImage(component, styleStore, functionStore)
	case "Picture":
		return convertPicture(component, styleStore, functionStore)
	case "Select":
		return convertSelect(component, styleStore, functionStore)
	case "Slider":
		return convertSlider(component, styleStore, functionStore)
	case "Bar":
		return convertChartBar(component, styleStore, functionStore)
	case "Area":
		return convertChartArea(component, styleStore, functionStore)
	case "Line":
		return convertChartLine(component, styleStore, functionStore)
	case "Pie":
		return convertChartPie(component, styleStore, functionStore)
	case "Doughnut":
		return convertChartDoughnut(component, styleStore, functionStore)
	case "Polar Area":
		return convertChartPolarArea(component, styleStore, functionStore)
	case "Radar":
		return convertChartRadar(component, styleStore, functionStore)
	case "Scatter":
		return convertChartScatter(component, styleStore, functionStore)
	case "Bubble":
		return convertChartBubble(component, styleStore, functionStore)
	case "Icon":
		return convertIcon(component, styleStore, functionStore)
	case "Collapsible":
		fallthrough
	case "Dropdown":
		return convertCollapsible(component, styleStore, functionStore)
	case "CollapsibleHeaderCollapsed":
		fallthrough
	case "DropdownHeaderCollapsed":
		return convertCollapsibleHeaderCollapsed(component, styleStore, functionStore)
	case "CollapsibleHeaderOpened":
		fallthrough
	case "DropdownHeaderOpened":
		return convertCollapsibleHeaderOpened(component, styleStore, functionStore)
	case "CollapsibleContent":
		fallthrough
	case "DropdownContent":
		return convertCollapsibleContent(component, styleStore, functionStore)
	case "Extension":
		return convertExtension(component, styleStore, functionStore)
	default:
		return "", fmt.Errorf("Unknown component type: %s", component["kind"])
	}
}
