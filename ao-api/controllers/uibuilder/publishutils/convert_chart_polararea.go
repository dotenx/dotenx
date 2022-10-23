package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"
)

type ChartPolarArea struct {
	Kind       string        `json:"kind"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
	RepeatFrom struct {
		Name     string
		Iterator string
	} `json:"repeatFrom"`
	Events     []Event  `json:"events"`
	ClassNames []string `json:"classNames"`
	Data       struct {
		Style struct {
			Desktop StyleModes `json:"desktop"`
			Tablet  StyleModes `json:"tablet"`
			Mobile  StyleModes `json:"mobile"`
		} `json:"style"`
		Options struct {
			Plugins struct {
				Title struct {
					Text string `json:"text"`
				} `json:"title"`
			} `json:"plugins"`
			Scales struct {
				X struct {
					Titles struct {
						Text string `json:"text"`
					} `json:"titles"`
				} `json:"x"`
				Y struct {
					Titles struct {
						Text string `json:"text"`
					} `json:"titles"`
				} `json:"y"`
			} `json:"scales"`
		} `json:"options"`
		AxisFrom struct {
			X struct {
				ListName string `json:"listName"`
				PropName string `json:"propName"`
			} `json:"x"`
			Y struct {
				ListName string `json:"listName"`
				PropName string `json:"propName"`
			} `json:"y"`
		} `json:"axisFrom"`
	} `json:"data"`
}

const polarAreaChartEffectTemplate = `
Alpine.effect(() => {
	const data = Alpine.store("{{.StoreName}}")?.{{.StoreName}};
	if (data) {
		polarAreaChart().renderChart({ data, xlabel: "{{.Xlabel}}", ylabel: "{{.Ylabel}}", chartId: "{{.Id}}", title: "{{.Title}}" })
	}
})
`

func convertChartPolarArea(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var chart ChartPolarArea

	json.Unmarshal(b, &chart)
	tmpl, err := template.New("chartPolarArea").Parse(chartTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	visibleAnimation, events := PullVisibleAnimation(chart.Events)
	chart.Events = events

	params := struct {
		ChartPolarArea
		VisibleAnimation VisibleAnimation
	}{
		chart,
		visibleAnimation,
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	effectTmpl, err := template.New("polarAreaChartEffect").Parse(polarAreaChartEffectTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	effectParams := struct {
		StoreName string
		Xlabel    string
		Ylabel    string
		Id        string
		Title     string
	}{
		StoreName: strings.TrimPrefix(chart.Data.AxisFrom.X.ListName, "$store."), // TODO: this is a hack, need to fix
		Xlabel:    chart.Data.AxisFrom.X.PropName,
		Ylabel:    chart.Data.AxisFrom.Y.PropName,
		Id:        chart.Id,
		Title:     chart.Data.Options.Plugins.Title.Text,
	}

	var effectOut bytes.Buffer
	err = effectTmpl.Execute(&effectOut, effectParams)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the chart type and the effect that renders the chart
	functionStore.AddChart("Polar Area", effectOut.String())

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(chart.Events)

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(chart.Id, chart.Data.Style.Desktop, chart.Data.Style.Tablet, chart.Data.Style.Mobile)

	return out.String(), nil
}
