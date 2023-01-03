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
		Name string `json:"name"`
		As   string `json:"as"`
	} `json:"data"`
}

const boxTemplate = `{{if .RepeatFrom.Iterator}}<template x-show="!{{.RepeatFrom.Name}}.isLoading" {{if .RepeatFrom.Name}}x-for="({{.RepeatFrom.Iterator}}, index) in {{renderRepeatFromName .RepeatFrom.Name}}"{{end}}>{{end}}<{{.As}} {{if .Bindings.Class.FromStateName}}:class="{{renderClassBinding .Bindings}}"{{end}} {{if or .Bindings.Show.FromStateName .Bindings.Hide.FromStateName}}x-show="{{renderBindings .Bindings}}"{{end}} id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}" {{if .VisibleAnimation.AnimationName}}x-intersect-class{{if .VisibleAnimation.Once}}.once{{end}}="animate__animated animate__{{.VisibleAnimation.AnimationName}}"{{end}} {{renderEvents .Events}} {{if .RepeatFrom.Name}}:key="index"{{end}}>{{.RenderedChildren}}</{{.As}}>{{if .RepeatFrom.Iterator}}</template>{{end}}`

func convertBox(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {

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
	var box Box
	json.Unmarshal(b, &box)
	tmpl, err := template.New("box").Funcs(funcMap).Parse(boxTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	visibleAnimation, events := PullVisibleAnimation(box.Events)
	box.Events = events

	var renderedChildren []string

	for _, child := range box.Components {
		renderedChild, err := convertComponentToHTML(child.(map[string]interface{}), styleStore, functionStore)
		if err != nil {
			fmt.Println(err)
			return "", err
		}
		renderedChildren = append(renderedChildren, renderedChild)
	}

	as := "div"
	if box.Data.As != "" {
		as = box.Data.As
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
		As string
	}{
		RenderedChildren: strings.Join(renderedChildren, "\n"),
		Id:               box.Id,
		ElementId:        box.ElementId,
		Bindings:         box.Bindings,
		RepeatFrom:       box.RepeatFrom,
		Events:           box.Events,
		ClassNames:       box.ClassNames,
		VisibleAnimation: visibleAnimation,
		As:               as,
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

type VisibleAnimation struct {
	AnimationName string
	Once          bool
}

func PullVisibleAnimation(events []Event) (VisibleAnimation, []Event) {
	// Note: if user chooses visible and visibleOnce, one of them will be ignored (ideally UI should prevent this)
	visibleAnimation := VisibleAnimation{}
	var newEvents []Event
	for _, event := range events {
		if event.Kind == "visible" { // Important: Only for visible and visibleOnce events we accept one and only one action which is an animation too
			visibleAnimation.AnimationName = event.Actions[0].AnimationName
			visibleAnimation.Once = false
		} else if event.Kind == "visibleOnce" {
			visibleAnimation.AnimationName = event.Actions[0].AnimationName
			visibleAnimation.Once = true
		} else {
			newEvents = append(newEvents, event)
		}
	}
	return visibleAnimation, newEvents
}

func renderRepeatFromName(name string) string {
	/*
		if `name` starts with $store.source, remove .source and place ?.data after the part after .source, o.w. return name
		for example, if name equals $store.source.x.y.z the function should return $store.x?.data.y.z
	*/
	if strings.HasPrefix(name, "$store.source") {
		tmp := strings.Replace(name, "$store.source.", "", 1)
		parts := strings.SplitN(tmp, ".", 2)
		if len(parts) == 1 {
			return fmt.Sprintf("$store.%s.data", parts[0])
		} else {
			return fmt.Sprintf("$store.%s.data?.%s", parts[0], parts[1])
		}
	} else {
		return name
	}

}

func RenderClassBinding(bindings Bindings) string {
	var renderedClassBinding = strings.Builder{}
	if bindings.Class.FromStateName != "" {
		renderedClassBinding.WriteString(fmt.Sprintf("(%s) ? '%s' : ''", renderBinding(bindings.Class), bindings.Class.Class))
	}
	return renderedClassBinding.String()
}

func RenderShowHideBindings(bindings Bindings) string {
	var renderedBindings = strings.Builder{}
	if bindings.Show.FromStateName != "" {
		renderedBindings.WriteString(renderBinding(bindings.Show))
		if bindings.Hide.FromStateName != "" {
			renderedBindings.WriteString(" || ")
		}
	}

	if bindings.Hide.FromStateName != "" {
		renderedBindings.WriteString(fmt.Sprintf("!%s", renderBinding(bindings.Hide)))
	}
	return renderedBindings.String()
}

func renderBinding(binding Binding) string {
	renderedValue := renderTextStates(binding.Value.Value)
	switch binding.Condition {
	case "equals":
		return fmt.Sprintf("%s == %s", binding.FromStateName, renderedValue)
	case "not equals":
		return fmt.Sprintf("%s != %s", binding.FromStateName, renderedValue)
	case "contains":
		return fmt.Sprintf("%s.includes(%s)", binding.FromStateName, renderedValue)
	case "not contains":
		return fmt.Sprintf("!%s.includes(%s)", binding.FromStateName, renderedValue)
	}
	return ""
}

func renderTextStates(textState []TextState) string {
	var renderedTextState = strings.Builder{}

	for _, s := range textState {
		toSend := s.Value
		if s.Kind == "state" {

			if strings.HasPrefix(s.Value, "$store.source") {
				toSend = strings.Replace(s.Value, "$store.source.", "", 1)
			} else {
				toSend = strings.Replace(s.Value, "$store.", "", 1)
			}

			parts := strings.SplitN(toSend, ".", 2)
			if len(parts) == 1 {
				toSend = fmt.Sprintf("Alpine.store('%s')", parts[0])
			} else {
				toSend = fmt.Sprintf("Alpine.store('%s').%s", parts[0], parts[1])
			}
			toSend = fmt.Sprintf("${%s}", toSend)
		}
		renderedTextState.WriteString(toSend)
	}

	return fmt.Sprintf("%s", renderedTextState.String())
}

func renderEvents(events []Event) string {

	var renderedEvents = strings.Builder{}

	for _, event := range events {
		if event.Kind == "intersection" {
			renderedEvents.WriteString(fmt.Sprintf(`x-intersect="%s(null) "`, event.Id))
		} else {
			renderedEvents.WriteString(fmt.Sprintf(`x-on:%s="%s(null) "`, event.Kind, event.Id))
			if event.Kind == "load" { // TODO: Remove this if it's not used.
				renderedEvents.WriteString(fmt.Sprintf(`x-init="{$nextTick => %s()}" `, event.Id))
			}
		}
	}

	return strings.TrimSpace(renderedEvents.String())
}
