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
	Method  string `json:"method"`
	Headers string `json:"headers"`
	Body    struct {
		Value []TextSource `json:"value"`
	} `json:"body"`
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
		data: null,
		fetch: function ({
			body,
			url,
			headers
		} = {
			body:{{if .Body.Value}}{{range .Body.Value}}{{renderTextSource .}}{{end}}{{else}}undefined{{end}},
			url:'{{range .Url.Value}}{{renderTextSource .}}{{end}}', 
			headers:{{if .Headers}}{{.Headers}}{{else}}{}{{end}}
		}) {

			{{if .IsPrivate}}headers = {...headers, Authorization: 'Bearer ' + Alpine.store('global')?.token };{{end}}

			fetch(url, {
				body,
				url,
				headers
			} = {
				method: '{{.Method}}',
				headers: headers,
				body: JSON.stringify(body)
			}={})
				.then(response => response.json())
				.then(data => {
					this.data = data;
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
