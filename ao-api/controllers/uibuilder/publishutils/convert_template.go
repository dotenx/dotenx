package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"
)

type Template struct {
	Kind       string        `json:"kind"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
	Events     []Event       `json:"events"`
	Bindings   Bindings      `json:"bindings"`
	ClassNames []string      `json:"classNames"`
	ElementId  string        `json:"elementId"`
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
		Name string `json:"name"`
	} `json:"data"`
}

const templateTemplate = `<template {{if .Bindings.Class.FromStateName}}:class="{{renderClassBinding .Bindings}}"{{end}} id="{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}" class="{{range .ClassNames}}{{.}} {{end}}" {{renderEvents .Events}}>{{.RenderedChildren}}</template>`

func convertTemplate(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {

	funcMap := template.FuncMap{
		"renderClassBinding": RenderClassBinding,
		"renderEvents":       renderEvents,
	}

	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var templateElement Template
	json.Unmarshal(b, &templateElement)
	tmpl, err := template.New("templateElement").Funcs(funcMap).Parse(templateTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var renderedChildren []string

	for _, child := range templateElement.Components {
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
		ElementId        string
		Bindings         Bindings
		Events           []Event
		ClassNames       []string
	}{
		RenderedChildren: strings.Join(renderedChildren, "\n"),
		Id:               templateElement.Id,
		ElementId:        templateElement.ElementId,
		Bindings:         templateElement.Bindings,
		Events:           templateElement.Events,
		ClassNames:       templateElement.ClassNames,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(templateElement.Events)

	// Add the styles to the styleStore to be rendered later
	id := templateElement.Id
	if templateElement.ElementId != "" {
		id = templateElement.ElementId
	}
	styleStore.AddStyle(id, templateElement.Data.Style.Desktop, templateElement.Data.Style.Tablet, templateElement.Data.Style.Mobile)
	styleStore.AddCustomStyle(id, templateElement.Data.CustomStyle.Desktop, templateElement.Data.CustomStyle.Tablet, templateElement.Data.CustomStyle.Mobile)

	return out.String(), nil
}
