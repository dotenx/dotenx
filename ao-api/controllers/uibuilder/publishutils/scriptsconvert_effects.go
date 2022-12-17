package publishutils

import (
	"bytes"
	"fmt"
	"text/template"

	"github.com/sirupsen/logrus"
)

func convertEffects(effects []string) (string, error) {
	const effectsTemplate = `document.addEventListener('alpine:init', () => {
	{{range .}}
	{{.}}
	
	{{end}}
})
`
	tmpl, err := template.New("effects").Parse(effectsTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, effects)
	if err != nil {
		logrus.Error(err.Error())
		return "", err
	}

	return out.String(), nil
}
