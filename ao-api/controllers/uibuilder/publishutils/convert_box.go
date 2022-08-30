package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"
)

type Box struct {
	Kind       string        `json:"kind"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
	RepeatFrom struct {
		Name     string
		Iterator string
	} `json:"repeatFrom"`
	Events []Event `json:"events"`
	Data   struct {
		Style struct {
			Desktop map[string]string `json:"desktop"`
			Tablet  map[string]string `json:"tablet"`
			Mobile  map[string]string `json:"mobile"`
		} `json:"style"`
		Name string `json:"name"`
	} `json:"data"`
}

const boxTemplate = `<div {{if .RepeatFrom.Name}}x-for="(index, {{.RepeatFrom.Iterator}}) in {{.RepeatFrom.Name}}"{{end}} id="{{.Id}}" class="dtx-{{.Id}}"><div {{range $index, $event := .Events}}x-on:{{$event.Kind}}="{{$event.Id}}()" {{end}} {{if .RepeatFrom.Name}}:key="index"{{end}}>{{.RenderedChildren}}</div></div>`

func convertBox(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var box Box
	json.Unmarshal(b, &box)
	fmt.Printf("box:::: %#v\n", box)
	tmpl, err := template.New("box").Parse(boxTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var renderedChildren []string

	for _, child := range box.Components {
		renderedChild, err := convertComponentToHTML(child.(map[string]interface{}), styleStore, functionStore)
		if err != nil {
			fmt.Println(err)
			return "", err
		}
		renderedChildren = append(renderedChildren, renderedChild)
	}

	params := struct {
		RenderedChildren string
		Id               string
		RepeatFrom       struct {
			Name     string
			Iterator string
		}
		Events []Event
	}{
		RenderedChildren: strings.Join(renderedChildren, "\n"),
		Id:               box.Id,
		RepeatFrom:       box.RepeatFrom,
		Events:           box.Events,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(box.Events)

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(box.Id, box.Data.Style.Desktop, box.Data.Style.Tablet, box.Data.Style.Mobile)

	return out.String(), nil
}
