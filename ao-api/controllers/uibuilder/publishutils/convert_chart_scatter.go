package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"
)

type ChartScatter struct {
	Kind       string        `json:"kind"`
	Id         string        `json:"id"`
	Components []interface{} `json:"components"`
	RepeatFrom struct {
		Name     string
		Iterator string
	} `json:"repeatFrom"`
	Events     []Event  `json:"events"`
	ClassNames []string `json:"classNames"`
	ElementId  string   `json:"elementId"`
	Bindings   Bindings `json:"bindings"`
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

const scatterChartEffectTemplate = `
Alpine.effect(() => {
	const data = Alpine.store("{{.StoreName}}")?.{{.StoreName}};
	if (data) {
		scatterChart().renderChart({ data, xlabel: "{{.Xlabel}}", ylabel: "{{.Ylabel}}", chartId: "{{if .ElementId}}{{.ElementId}}{{else}}{{.Id}}{{end}}", title: "{{.Title}}",
		borderColor: "{{.BorderColor}}", pointBackgroundColor: "{{.PointBackgroundColor}}", backgroundColor: "{{.BackgroundColor}}" })
	}
})
`

func convertChartScatter(component map[string]interface{}, styleStore *StyleStore, functionStore *FunctionStore) (string, error) {
	funcMap := template.FuncMap{
		"renderBindings": RenderBindings,
	}
	b, err := json.Marshal(component)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var chart ChartScatter

	json.Unmarshal(b, &chart)
	tmpl, err := template.New("chartScatter").Funcs(funcMap).Parse(chartTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	visibleAnimation, events := PullVisibleAnimation(chart.Events)
	chart.Events = events

	params := struct {
		ChartScatter
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

	effectTmpl, err := template.New("scatterChartEffect").Parse(scatterChartEffectTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	effectParams := struct {
		StoreName            string
		Xlabel               string
		Ylabel               string
		Id                   string
		ElementId            string
		Title                string
		BorderColor          string
		PointBackgroundColor string
		BackgroundColor      string
	}{
		StoreName:            strings.TrimPrefix(chart.Data.AxisFrom.X.ListName, "$store."), // TODO: this is a hack, need to fix
		Xlabel:               chart.Data.AxisFrom.X.PropName,
		Ylabel:               chart.Data.AxisFrom.Y.PropName,
		Id:                   chart.Id,
		ElementId:            chart.ElementId,
		Title:                chart.Data.Options.Plugins.Title.Text,
		BorderColor:          "rgb(53, 162, 235)",       // Todo: get this from the UI
		PointBackgroundColor: "rgb(53, 162, 235)",       // Todo: get this from the UI
		BackgroundColor:      "rgba(53, 162, 235, 0.5)", // Todo: get this from the UI
	}

	var effectOut bytes.Buffer
	err = effectTmpl.Execute(&effectOut, effectParams)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	// Add the chart type and the effect that renders the chart
	functionStore.AddChart("Scatter", effectOut.String())

	// Add the events to the function store to be rendered later
	functionStore.AddEvents(chart.Events)

	// Add the styles to the styleStore to be rendered later
	styleStore.AddStyle(chart.Id, chart.Data.Style.Desktop, chart.Data.Style.Tablet, chart.Data.Style.Mobile)

	return out.String(), nil
}
