package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"

	"github.com/sirupsen/logrus"
)

type DataSource struct {
	StateName   string `json:"stateName"`
	Url         string `json:"url"`
	Method      string `json:"method"`
	Headers     string `json:"headers"`
	Body        string `json:"body"`
	Id          string `json:"id"`
	FetchOnload bool   `json:"fetchOnload"`
	IsPrivate   bool   `json:"isPrivate"`
}

func convertDataSources(dataSources []interface{}) (string, error) {
	const dataSourcesTemplate = `document.addEventListener('alpine:init', () => {
	{{range .}}
	Alpine.store('{{.StateName}}', {
		isLoading: true,
		{{.StateName}}: Alpine.store(null),
		fetch: function ({body{{if .Body}}={{.Body}}{{end}}}={}) {

			url = '{{.Url}}';
			fetch(url, {
				method: '{{.Method}}',
				{{if .Headers}}headers: {{if .IsPrivate}}(...{{.Headers}}, ...{Authorization: 'Bearer ' + App.store('global').token } ){{else}}{{.Headers}},{{end}}{{else}}{{if .IsPrivate}}headers: {Authorization: 'Bearer ' + App.store('global').token },{{end}}{{end}}
				...(body? {body: JSON.stringify(body)} : {})
			})
				.then(response => response.json())
				.then(data => {
					this.{{.StateName}} = data;
					this.isLoading = false;
				})
		}
	})
	{{if .FetchOnload}}Alpine.store('{{.StateName}}').fetch();{{end}}
	{{end}}
})
`

	b, err := json.Marshal(dataSources)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var ds []DataSource
	json.Unmarshal(b, &ds)
	fmt.Println(ds)
	tmpl, err := template.New("dataSources").Parse(dataSourcesTemplate)
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

	return out.String(), nil
}
