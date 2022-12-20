package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type Picture struct {
	Kind       string        `json:"kind"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
	Events     []Event       `json:"events"`
	Bindings   Bindings      `json:"bindings"`
	RepeatFrom struct {
		Name     string
		Iterator string
	} `json:"repeatFrom"`
	ClassNames []string `json:"classNames"`
	ElementId  string   `json:"elementId"`
	Data       struct {
		Style struct {
			Desktop StyleModes `json:"desktop"`
			Tablet  StyleModes `json:"tablet"`
			Mobile  StyleModes `json:"mobile"`
		} `json:"style"`
		Alt        string `json:"alt"`
		DesktopSrc string `json:"desktopSrc"`
		TabletSrc  string `json:"tabletSrc"`
		MobileSrc  string `json:"mobileSrc"`
	} `json:"data"`
}

const pictureTemplate = `{{if .RepeatFrom.Name}}<template x-for="(index, {{.RepeatFrom.Iterator}}) in {{renderRepeatFromName .RepeatFrom.Name}}">{{end}}<picture {{if .Bindings.Class.FromStateName}}:class="{{renderClassBinding .Bindings}}"{{end}} {{if or .Bindings.Show.FromStateName .Bindings.Hide.FromStateName}}x-show="{{renderBindings .Bindings}}"{{end}} {{if .VisibleAnimation.AnimationName}}x-intersect-class{{if .VisibleAnimation.Once}}.once{{end}}="animate__animated animate__{{.VisibleAnimation.AnimationName}}"{{end}} {{renderEvents .Events}} {{if .RepeatFrom.Name}}:key="index"{{end}} id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}" alt="{{.Data.Alt}}">
{{if .Data.TabletSrc}}<source media="(max-width: 767px)" srcset="{{.Data.TabletSrc}}">{{end}}
{{if .Data.MobileSrc}}<source media="(max-width: 478px)" srcset="{{.Data.MobileSrc}}">{{end}}
<img src={{.Data.MobileSrc}}>
</picture>{{if .RepeatFrom.Name}}</template>{{end}}`

func convertPicture(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {

	funcMap := template.FuncMap{
		"renderTextSource":     renderTextSource,
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
	var picture Picture
	json.Unmarshal(b, &picture)
	tmpl, err := template.New("picture").Funcs(funcMap).Parse(pictureTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	visibleAnimation, events := PullVisibleAnimation(picture.Events)
	picture.Events = events

	params := struct {
		Picture
		VisibleAnimation VisibleAnimation
	}{
		picture,
		visibleAnimation,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(picture.Events)

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(picture.Id, picture.Data.Style.Desktop, picture.Data.Style.Tablet, picture.Data.Style.Mobile)

	return out.String(), nil
}
