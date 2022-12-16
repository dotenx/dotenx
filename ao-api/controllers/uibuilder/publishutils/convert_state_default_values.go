package publishutils

import (
	"bytes"
	"fmt"
	"strings"
	"text/template"
)

const defaultValues = `
document.addEventListener("alpine:init", () => {
  {{range $key, $value := .}}
  {{renderDefaultValue $key $value}}
  {{end}}
})
`

func renderDefaultValue(key string, value interface{}) string {
	if strings.HasPrefix(key, "$store.page") {
		return fmt.Sprintf("Alpine.store('page').set('%s',%v)", strings.TrimPrefix(key, "$store.page."), value)
	} else {
		return fmt.Sprintf("Alpine.store('global').set('%s',%v)", strings.TrimPrefix(key, "$store.global."), value)
	}
}

func convertStateDefaultValues(statesDefaultValues map[string]interface{}) (string, error) {
	funcMap := template.FuncMap{
		"renderDefaultValue": renderDefaultValue,
	}
	if len(statesDefaultValues) == 0 {
		return "", nil
	}

	tmpl, err := template.New("stateDefaultValues").Funcs(funcMap).Parse(defaultValues)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var buf bytes.Buffer
	err = tmpl.Execute(&buf, statesDefaultValues)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}

	return buf.String(), nil
}
