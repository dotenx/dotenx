package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"

	"github.com/sirupsen/logrus"
)

type DataSource struct {
	StateName string `json:"stateName"`
	Url       struct {
		Value []TextSource `json:"value"`
	} `json:"url"`
	Method      string        `json:"method"`
	Headers     string        `json:"headers"`
	Body        string        `json:"body"`
	Id          string        `json:"id"`
	FetchOnload bool          `json:"fetchOnload"`
	IsPrivate   bool          `json:"isPrivate"`
	OnSuccess   []EventAction `json:"onSuccess"`
	OnError     []EventAction `json:"onError"`
}

func convertDataSources(dataSources []interface{}) (string, error) {
	const dataSourcesTemplate = `document.addEventListener('alpine:init', () => {
	{{range .}}
	Alpine.store('{{.StateName}}', {
		isLoading: true,
		'{{.StateName}}': Alpine.store(null),
		fetch: function ({body{{if .Body}}={{.Body}}{{end}}}={}) {

			url = '{{range .Url.Value}}{{renderTextSource .}} {{end}}';
			fetch(url, {
				method: '{{.Method}}',
				{{if .Headers}}headers: {{if .IsPrivate}}(...{{.Headers}}, ...{Authorization: 'Bearer ' + App.store('global').token } ){{else}}{{.Headers}},{{end}}{{else}}{{if .IsPrivate}}headers: {Authorization: 'Bearer ' + App.store('global').token },{{end}}{{end}}
				...(body? {body: JSON.stringify(body)} : {})
			})
				.then(response => response.json())
				.then(data => {
					this['{{.StateName}}'] = data;
					{{if .OnSuccess}}{{.Id}}_success(data);{{end}}
				})
				.catch(error => {
					{{if .OnError}}{{.Id}}_error(data);{{end}}
					this.error = error
				})
				.finally(() => this.isLoading = false);
		}
	})
	{{if .FetchOnload}}Alpine.store('{{.StateName}}').fetch();{{end}}
	{{end}}
})
`
	b, err := json.Marshal(dataSources)
	if err != nil {
		logrus.Error(err.Error())
		return "", err
	}

	var ds []DataSource
	json.Unmarshal(b, &ds)
	if len(ds) == 0 {
		return "", nil
	}

	funcMap := template.FuncMap{
		// The name "title" is what the function will be called in the template text.
		"renderTextSource": renderTextSource,
	}

	tmpl, err := template.New("dataSources").Funcs(funcMap).Parse(dataSourcesTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, ds)
	if err != nil {
		logrus.Error(err.Error())
		return "", err
	}

	// Convert data-source events
	for _, dataSource := range ds {
		if len(dataSource.OnSuccess) > 0 {

			onSuccess := Event{
				Id:      dataSource.Id + "_success",
				Actions: dataSource.OnSuccess,
			}

			renderedEvent, err := convertEvent(onSuccess)
			if err != nil {
				return "", err
			}
			out.WriteString(renderedEvent)
		}

		if len(dataSource.OnError) > 0 {

			onError := Event{
				Id:      dataSource.Id + "_error",
				Actions: dataSource.OnError,
			}

			renderedEvent, err := convertEvent(onError)
			if err != nil {
				return "", err
			}
			out.WriteString(renderedEvent)
		}
	}

	return out.String(), nil
}
