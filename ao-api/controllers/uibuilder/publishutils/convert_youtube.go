package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type YouTube struct {
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
		CustomStyle struct {
			Desktop map[string]map[string]string `json:"desktop"`
			Tablet  map[string]map[string]string `json:"tablet"`
			Mobile  map[string]map[string]string `json:"mobile"`
		} `json:"customStyle"`
		Src string `json:"src"`
	} `json:"data"`
}

const youtubeTemplate = `{{if .RepeatFrom.Name}}<template x-for="({{.RepeatFrom.Iterator}}, index) in {{renderRepeatFromName .RepeatFrom.Name}}">{{end}}<iframe {{if .Bindings.Class.FromStateName}}:class="{{renderClassBinding .Bindings}}"{{end}} {{if or .Bindings.Show.FromStateName .Bindings.Hide.FromStateName}}x-show="{{renderBindings .Bindings}}"{{end}}  {{renderEvents .Events}} {{if .RepeatFrom.Name}}:key="index"{{end}} id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}" src="{{.Data.Src}}" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />{{if .RepeatFrom.Name}}</template>{{end}}`

func convertYouTube(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {

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
	var youtube YouTube
	json.Unmarshal(b, &youtube)
	tmpl, err := template.New("youtube").Funcs(funcMap).Parse(youtubeTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	params := struct {
		YouTube
	}{
		youtube,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(youtube.Events)

	// Add the styles to the styleStore to be rendered later
	id := youtube.Id
	if youtube.ElementId != "" {
		id = youtube.ElementId
	}
	styleStore.AddStyle(id, youtube.Data.Style.Desktop, youtube.Data.Style.Tablet, youtube.Data.Style.Mobile)
	styleStore.AddCustomStyle(id, youtube.Data.CustomStyle.Desktop, youtube.Data.CustomStyle.Tablet, youtube.Data.CustomStyle.Mobile)

	return out.String(), nil
}
