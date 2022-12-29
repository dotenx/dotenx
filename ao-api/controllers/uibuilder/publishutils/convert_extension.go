package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"

	"github.com/sirupsen/logrus"
)

type Extension struct {
	Kind       string        `json:"kind"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
	RepeatFrom struct {
		Name     string
		Iterator string
	} `json:"repeatFrom"`
	Events     []Event  `json:"events"`
	Bindings   Bindings `json:"bindings"`
	ClassNames []string `json:"classNames"`
	ElementId  string   `json:"elementId"`
	Data       struct {
		Style struct {
			Desktop StyleModes `json:"desktop"`
			Tablet  StyleModes `json:"tablet"`
			Mobile  StyleModes `json:"mobile"`
		} `json:"style"`
		UserInputs map[string]struct {
			Value []TextState `json:"value"`
		} `json:"userInputs"`
		Extension struct {
			Name    string `json:"name"`
			Content struct {
				Html   string `json:"html"`
				Init   string `json:"init"`
				Action string `json:"action"`
				Head   string `json:"head"`
			} `json:"content"`
		} `json:"extension"`
		As string `json:"as"`
	} `json:"data"`
}

func convertExtension(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	const extensionTemplate = `{{if .RepeatFrom.Iterator}}<template x-show="!{{.RepeatFrom.Name}}.isLoading" {{if .RepeatFrom.Name}}x-for="(index, {{.RepeatFrom.Iterator}}) in {{renderRepeatFromName .RepeatFrom.Name}}"{{end}}>{{end}}<div {{if .Bindings.Class.FromStateName}}:class="{{renderClassBinding .Bindings}}"{{end}} {{if or .Bindings.Show.FromStateName .Bindings.Hide.FromStateName}}x-show="{{renderBindings .Bindings}}"{{end}} id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}" {{if .VisibleAnimation.AnimationName}}x-intersect-class{{if .VisibleAnimation.Once}}.once{{end}}="animate__animated animate__{{.VisibleAnimation.AnimationName}}"{{end}} {{renderEvents .Events}} {{if .RepeatFrom.Name}}:key="index"{{end}}>{{.RenderedChildren}}{{.Html}}</div>{{if .RepeatFrom.Iterator}}</template>{{end}}`

	funcMap := template.FuncMap{
		"renderClassBinding":   RenderClassBinding,
		"renderBindings":       RenderShowHideBindings,
		"renderEvents":         renderEvents,
		"renderRepeatFromName": renderRepeatFromName,
	}

	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var extension Extension
	json.Unmarshal(b, &extension)
	tmpl, err := template.New("extension").Funcs(funcMap).Parse(extensionTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	visibleAnimation, events := PullVisibleAnimation(extension.Events)
	extension.Events = events

	var renderedChildren []string

	for _, child := range extension.Components {
		renderedChild, err := convertComponentToHTML(child.(map[string]interface{}), styleStore, functionStore)
		if err != nil {
			fmt.Println(err)
			return "", err
		}
		renderedChildren = append(renderedChildren, renderedChild)
	}

	childrenTemplate := ""

	if len(renderedChildren) > 0 {
		childrenTemplate = fmt.Sprintf("<template>%s</template>", strings.Join(renderedChildren, "\n"))
	}

	params := struct {
		RenderedChildren string
		Id               string
		ElementId        string
		Bindings         Bindings
		RepeatFrom       struct {
			Name     string
			Iterator string
		}
		Events     []Event
		ClassNames []string
		VisibleAnimation
		Html string
	}{
		RenderedChildren: childrenTemplate,
		Id:               extension.Id,
		ElementId:        extension.ElementId,
		Bindings:         extension.Bindings,
		RepeatFrom:       extension.RepeatFrom,
		Events:           extension.Events,
		ClassNames:       extension.ClassNames,
		VisibleAnimation: visibleAnimation,
		Html:             extension.Data.Extension.Content.Html,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(extension.Events)

	convertedExtensionScript, err := convertExtensionScript(extension.Id, extension.Data.Extension.Content.Init, extension.Data.Extension.Content.Action, extension.Data.UserInputs)
	if err != nil {
		logrus.Error(err)
		return "", err
	}

	// Add the rendered extension script to the function store to be rendered later
	functionStore.AddExtension(convertedExtensionScript)

	if len(extension.Data.Extension.Content.Head) > 0 {
		functionStore.AddExtensionHead(extension.Data.Extension.Content.Head)
	}

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(extension.Id, extension.Data.Style.Desktop, extension.Data.Style.Tablet, extension.Data.Style.Mobile)

	return out.String(), nil
}

func convertExtensionScript(id, init, action string, data map[string]struct {
	Value []TextState `json:"value"`
}) (string, error) {

	const extensionScriptTemplate = `
	document.addEventListener("alpine:init", () => {

		const init = {{.Init}}

		Alpine.store('{{.Id}}', {
			root: '{{.Id}}',
			data:  {
				{{range $key, $value := .Data}}
				{{$key}}: {{renderTextStates $value.Value}},
				{{end}}
			},
			init() {
				init({
					data: Alpine.store('{{.Id}}').data,
					root: Alpine.store('{{.Id}}').root,
					fetchDataSource: (name, {body, headers, url} = {}) => Alpine.store(name).fetch({body, headers, url}),
					setPageState: (name, value, key) => Alpine.store('page').set(name, value, key),
					setGlobalState: (name, value, key) => Alpine.store('global').set(name, value, key),
				})
			}
		})
	})
	`

	funcMap := template.FuncMap{
		"renderTextStates": renderTextStates,
	}

	tmpl, err := template.New("extensionScript").Funcs(funcMap).Parse(extensionScriptTemplate)
	if err != nil {
		logrus.Error(err)
		return "", err
	}

	params := struct {
		Id     string
		Init   string
		Action string
		Data   map[string]struct {
			Value []TextState `json:"value"`
		}
	}{
		Id:     id,
		Init:   init,
		Action: action,
		Data:   data,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		logrus.Error(err)
		return "", err
	}

	return out.String(), nil
}
