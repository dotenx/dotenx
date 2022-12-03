package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type TextSource struct {
	Kind  string `json:"kind"`
	Value string `json:"value"`
}
type Text struct {
	Kind       string        `json:"type"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
	Events     []Event       `json:"events"`
	RepeatFrom struct {
		Name     string
		Iterator string
	} `json:"repeatFrom"`
	ClassNames []string `json:"classNames"`
	ElementId  string   `json:"elementId"`
	Bindings   Bindings `json:"bindings"`
	Data       struct {
		Style struct {
			Desktop StyleModes `json:"desktop"`
			Tablet  StyleModes `json:"tablet"`
			Mobile  StyleModes `json:"mobile"`
		} `json:"style"`
		Text struct {
			Value []TextSource `json:"value"`
		} `json:"text"`
	} `json:"data"`
}

func renderTextSource(textSource TextSource) string {
	if textSource.Kind == "text" {
		return textSource.Value
	} else {
		return fmt.Sprintf(`${%s}`, textSource.Value)
	}
}

// TODO: id in templates rendered with RepeatFrom won't work! Do something about it

const textTemplate = `{{if .RepeatFrom.Name}}<template x-for="(index, {{.RepeatFrom.Iterator}}) in {{.RepeatFrom.Name}}">{{end}}<div x-show="{{renderBindings .Bindings}}" {{if .VisibleAnimation.AnimationName}}x-intersect-class{{if .VisibleAnimation.Once}}.once{{end}}="animate__animated animate__{{.VisibleAnimation.AnimationName}}"{{end}} {{range $index, $event := .Events}}x-on:{{$event.Kind}}="{{$event.Id}}($event)" {{end}} {{if .RepeatFrom.Name}}:key="index"{{end}} id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}" display="inline" x-html="` + "`" + "{{range .Data.Text.Value}}{{renderTextSource .}}{{end}}" + "`" + `"></div>{{if .RepeatFrom.Name}}</template>{{end}}`

func convertText(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {

	funcMap := template.FuncMap{
		// The name "title" is what the function will be called in the template text.
		"renderTextSource": renderTextSource,
		"renderBindings":   RenderBindings,
	}

	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var text Text
	json.Unmarshal(b, &text)
	// fmt.Printf("%#v\n", text)
	tmpl, err := template.New("text").Funcs(funcMap).Parse(textTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	visibleAnimation, events := PullVisibleAnimation(text.Events)
	text.Events = events

	params := struct {
		Text
		VisibleAnimation VisibleAnimation
	}{
		text,
		visibleAnimation,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(text.Events)

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(text.Id, text.Data.Style.Desktop, text.Data.Style.Tablet, text.Data.Style.Mobile)

	return out.String(), nil
}
