package publishutils

import (
	"bytes"
	"fmt"
	"strings"
	"text/template"

	"github.com/sirupsen/logrus"
)

func convertEvent(event Event) (string, error) {
	const dataSourcesTemplate = `function {{.Id}}(dtx_event){
		{{.RenderedActions}}
	}
`

	var actionsRendered strings.Builder
	for _, action := range event.Actions {
		renderedAction, err := convertAction(action)
		if err != nil {
			return "", err
		}
		actionsRendered.WriteString(renderedAction + "\n")
	}

	tmpl, err := template.New("dataSources").Parse(dataSourcesTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	params := struct {
		Id              string
		RenderedActions string
	}{
		Id:              event.Id,
		RenderedActions: actionsRendered.String(),
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		logrus.Error(err.Error())
		return "", err
	}

	return out.String(), nil

}

func convertAction(action EventAction) (string, error) {
	const codeTemplate = `function {{.Id}}(dtx_event){
		{{.Code}}
	}
	{{.Id}}();
`

	const toggleStateTemplate = `
	Alpine.store('{{.Name}}', !Alpine.store('{{.Name}}'))
	`

	const setStateTemplate = `
	Alpine.store('{{.Name}}', "{{.ValueToSet}}")
	`

	const fetchTemplate = `
	Alpine.store({{.DataSourceName}}).fetch({{.Body}});
	`

	var actionTemplate string
	switch action.Kind {
	case "Toggle State":
		actionTemplate = toggleStateTemplate
	case "Set State":
		actionTemplate = setStateTemplate
	case "Code":
		actionTemplate = codeTemplate
	case "Fetch":
		actionTemplate = fetchTemplate
	}

	tmpl, err := template.New("action").Parse(actionTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, action)
	if err != nil {
		logrus.Error(err.Error())
		return "", err
	}

	return out.String(), nil
}
