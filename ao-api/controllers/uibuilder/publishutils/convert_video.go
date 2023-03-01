package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type Video struct {
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
		Src      string `json:"src"`
		Poster   string `json:"poster"`
		Controls bool   `json:"controls"`
		Autoplay bool   `json:"autoplay"`
		Loop     bool   `json:"loop"`
		Muted    bool   `json:"muted"`
	} `json:"data"`
}

const videoTemplate = `{{if .RepeatFrom.Name}}<template x-for="({{.RepeatFrom.Iterator}}, index) in {{renderRepeatFromName .RepeatFrom.Name}}">{{end}}<video {{if .Bindings.Class.FromStateName}}:class="{{renderClassBinding .Bindings}}"{{end}} {{if or .Bindings.Show.FromStateName .Bindings.Hide.FromStateName}}x-show="{{renderBindings .Bindings}}"{{end}}  {{renderEvents .Events}} {{if .RepeatFrom.Name}}:key="index"{{end}} id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}" src="{{.Data.Src}}" {{if .Data.Poster}}poster="{{.Data.Poster}}"{{end}} controls="{{.Data.Controls}}" autoplay="{{.Data.Autoplay}}" loop="{{.Data.Loop}}" muted="{{.Data.Muted}}">Sorry, your browser doesn't support embedded videos.</video>{{if .RepeatFrom.Name}}</template>{{end}}`

func convertVideo(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {

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
	var video Video
	json.Unmarshal(b, &video)
	tmpl, err := template.New("video").Funcs(funcMap).Parse(videoTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	params := struct {
		Video
	}{
		video,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(video.Events)

	// Add the styles to the styleStore to be rendered later
	id := video.Id
	if video.ElementId != "" {
		id = video.ElementId
	}
	styleStore.AddStyle(id, video.Data.Style.Desktop, video.Data.Style.Tablet, video.Data.Style.Mobile)
	styleStore.AddCustomStyle(id, video.Data.CustomStyle.Desktop, video.Data.CustomStyle.Tablet, video.Data.CustomStyle.Mobile)

	return out.String(), nil
}
