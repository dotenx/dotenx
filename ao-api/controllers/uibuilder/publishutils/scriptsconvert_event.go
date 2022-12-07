package publishutils

import (
	"bytes"
	"fmt"
	"strings"
	"text/template"

	"github.com/sirupsen/logrus"
)

func convertEvent(event Event) (string, error) {
	const eventTemplate = `function {{.Id}}(dtx_event){
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

	tmpl, err := template.New("event").Parse(eventTemplate)
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

	funcMap := template.FuncMap{

		"renderTextStates": renderTextStates,

		"renderValueSource": func(valueSource ValueSource) string {

			if valueSource.Value == "" {
				return ""
			}

			switch valueSource.Mode {
			case "page":
				fallthrough
			case "global":
				fallthrough
			case "url":
				return fmt.Sprintf("$store.%s.%s", valueSource.Mode, valueSource.Value)
			case "source":
				return fmt.Sprintf("$store.%s", valueSource.Value)
			case "response":
				return fmt.Sprintf("dtx_event.%s", valueSource.Value)
			default:
				return fmt.Sprintf(`"%s"`, valueSource.Value)
			}
		},
	}

	const codeTemplate = `function {{.Id}}(dtx_event){
		{{.Code}}
	}
	{{.Id}}(dtx_event);
`

	const navigateTemplate = `
	window.location.href="{{renderTextStates .To.Value}}"
	`
	const toggleStateTemplate = `
	Alpine.store('{{.StateName.Mode}}').toggle("{{.StateName.Value}}")
	`

	const setStateTemplate = `
	Alpine.store('{{.StateName.Mode}}').set("{{.StateName.Value}}", {{renderValueSource .Value}}{{if .Key.Value}}, {{renderValueSource .Key}}{{end}})
	`

	const pushStateTemplate = `
	Alpine.store('{{.StateName.Mode}}').set("{{.StateName.Value}}", {{renderValueSource .Value}})
	`

	const incStateTemplate = `
	Alpine.store('{{.StateName.Mode}}').set("{{.StateName.Value}}"{{if .Key.Value}}, {{renderValueSource .Key}}{{end}})
	`

	const decStateTemplate = `
	Alpine.store('{{.StateName.Mode}}').set("{{.StateName.Value}}"{{if .Key.Value}}, {{renderValueSource .Key}}{{end}})
	`

	const fetchTemplate = `
	Alpine.store({{.DataSourceName}}).fetch({{.Body}});
	`
	const animateTemplate = `
	function {{.Id}}(dtx_event){
		new Promise((resolve, reject) => {
			const prefix = "animate__";
			const animationName = prefix + "{{.AnimationName}}";
			const node = dtx_event.target;
			
			node.classList.add(prefix + "animated", animationName);
	
			// When the animation ends, we clean the classes and resolve the Promise
			function handleAnimationEnd(event) {
				event.stopPropagation();
				node.classList.remove(prefix + "animated", animationName);
				resolve('Animation ended');
			}
	
			node.addEventListener('animationend', handleAnimationEnd, {once: true});
		})
	}
	{{.Id}}(dtx_event);
	`

	var actionTemplate string
	switch action.Kind {
	case "Toggle State":
		actionTemplate = toggleStateTemplate
	case "Set State":
		actionTemplate = setStateTemplate
	case "Push State":
		actionTemplate = pushStateTemplate
	case "Inc State":
		actionTemplate = incStateTemplate
	case "Dec State":
		actionTemplate = decStateTemplate
	case "Code":
		actionTemplate = codeTemplate
	case "Fetch":
		actionTemplate = fetchTemplate
	case "Animation":
		actionTemplate = animateTemplate
	case "Navigate":
		actionTemplate = navigateTemplate

	}

	tmpl, err := template.New("action").Funcs(funcMap).Parse(actionTemplate)
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
