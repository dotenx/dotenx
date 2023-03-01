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
		CustomStyle struct {
			Desktop map[string]map[string]string `json:"desktop"`
			Tablet  map[string]map[string]string `json:"tablet"`
			Mobile  map[string]map[string]string `json:"mobile"`
		} `json:"customStyle"`
		// UserInputs map[string]struct {
		// 	Value []TextState `json:"value"`
		// } `json:"userInputs"`
		UserInputs map[string]interface{} `json:"userInputs"`
		Extension  struct {
			Name    string `json:"name"`
			Content struct {
				Html   string `json:"html"`
				Init   string `json:"init"`
				Action string `json:"action"`
				Update string `json:"update"`
				Head   string `json:"head"`
			} `json:"content"`
		} `json:"extension"`
		As string `json:"as"`
	} `json:"data"`
}

func convertExtension(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	const extensionTemplate = `{{if .RepeatFrom.Iterator}}<template x-show="!{{.RepeatFrom.Name}}.isLoading" {{if .RepeatFrom.Name}}x-for="({{.RepeatFrom.Iterator}}, index) in {{renderRepeatFromName .RepeatFrom.Name}}"{{end}}>{{end}}<div x-effect="$store.{{.Id}}.update({...$store.{{.Id}}.data, ...{ {{.DynamicInputs}} }})" {{if .Bindings.Class.FromStateName}}:class="{{renderClassBinding .Bindings}}"{{end}} {{if or .Bindings.Show.FromStateName .Bindings.Hide.FromStateName}}x-show="{{renderBindings .Bindings}}"{{end}} id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}" {{renderEvents .Events}} {{if .RepeatFrom.Name}}:key="index"{{end}}>{{.RenderedChildren}}{{.Html}}</div>{{if .RepeatFrom.Iterator}}</template>{{end}}`

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
		Html          string
		DynamicInputs string
	}{
		RenderedChildren: childrenTemplate,
		Id:               extension.Id,
		ElementId:        extension.ElementId,
		Bindings:         extension.Bindings,
		RepeatFrom:       extension.RepeatFrom,
		Events:           extension.Events,
		ClassNames:       extension.ClassNames,
		Html:             extension.Data.Extension.Content.Html,
		DynamicInputs:    renderDynamicInputs(extension.Data.UserInputs),
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(extension.Events)

	convertedExtensionScript, err := convertExtensionScript(extension.Id, extension.Data.Extension.Content.Init, extension.Data.Extension.Content.Update, extension.Data.Extension.Content.Action, extension.Data.UserInputs)
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
	id := extension.Id
	if extension.ElementId != "" {
		id = extension.ElementId
	}
	styleStore.AddStyle(id, extension.Data.Style.Desktop, extension.Data.Style.Tablet, extension.Data.Style.Mobile)

	return out.String(), nil
}

func convertExtensionScript(id, init, update, action string, data map[string]interface{}) (string, error) {

	const extensionScriptTemplate = `
	document.addEventListener("alpine:init", () => {

		const init = {{.Init}}

		const update = {{.Update}}

		Alpine.store('{{.Id}}', {
			root: '{{.Id}}',
			data:  {
				{{range $key, $value := .Data}}
				{{$key}}: {{if isState $value}}{{stringifyRenderTextStates $value}}{{else}}{{$value}}{{end}},
				{{end}}
			},
			init() {
				init({
					data: Alpine.store('{{.Id}}').data,
					context: {
						root: '{{.Id}}',
						fetchDataSource: (name, {body, headers, url} = {}) => Alpine.store(name).fetch({body, headers, url}),
						setPageState: (name, value, key) => Alpine.store('page').set(name, value, key),
						setGlobalState: (name, value, key) => Alpine.store('global').set(name, value, key),
					}
				})
			},
			update: (data) => update({
				data,
				context: {
					root: '{{.Id}}',
					fetchDataSource: (name, {body, headers, url} = {}) => Alpine.store(name).fetch({body, headers, url}),
					setPageState: (name, value, key) => Alpine.store('page').set(name, value, key),
					setGlobalState: (name, value, key) => Alpine.store('global').set(name, value, key),
				}
			})
		})
	})
	`

	funcMap := template.FuncMap{
		"stringifyRenderTextStates": stringifyRenderTextStates,
		"isState":                   isState,
	}

	tmpl, err := template.New("extensionScript").Funcs(funcMap).Parse(extensionScriptTemplate)
	if err != nil {
		logrus.Error(err)
		return "", err
	}

	params := struct {
		Id     string
		Init   string
		Update string
		Action string
		Data   map[string]interface{}
	}{
		Id:     id,
		Init:   init,
		Update: update,
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

// This function filters out the dynamic inputs and returns a key:`value`, string for them
func renderDynamicInputs(data map[string]interface{}) string {

	type t struct {
		Value []TextState `json:"value"`
	}

	var inputs []string
	for key, value := range data {

		// Check if the value is a state
		var tmp t
		b, _ := json.Marshal(value)
		err := json.Unmarshal(b, &tmp)
		if err != nil {
			continue
		}

		r := make([]string, len(tmp.Value))
		for i, v := range tmp.Value {
			r[i] = renderTextSource(TextSource{
				Kind:  v.Kind,
				Value: v.Value,
			})
		}
		inputs = append(inputs, fmt.Sprintf("%s: `%s`", key, strings.Join(r, "")))
	}
	return strings.Join(inputs, ",")
}

func stringifyRenderTextStates(i interface{}) string {

	type t struct {
		Value []TextState `json:"value"`
	}
	var textStates t
	b, _ := json.Marshal(i)
	json.Unmarshal(b, &textStates)

	s := renderTextStates(textStates.Value)
	return fmt.Sprintf("`%s`", s)
}

func isState(mi interface{}) bool {

	type t struct {
		Value []TextState `json:"value"`
	}
	var tmp t

	b, _ := json.Marshal(mi)

	err := json.Unmarshal(b, &tmp)

	if err != nil {
		return false
	}
	return true

}
