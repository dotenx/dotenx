package miniTasks

import (
	"bytes"
	"encoding/json"
	"fmt"
	"text/template"
)

type If struct {
	Type   string `json:"type"`
	Name   string `json:"name"`
	Params struct {
		Branches []struct {
			Condition string        `json:"condition"`
			Body      []interface{} `json:"body"`
		} `json:"branches"`
		ElseBranch []interface{} `json:"elseBranch"`
	} `json:"params"`
}

const ifTemplate = `{{range $index, $branch := .Branches}}{{if (eq $index 0)}}if {{else}} else if{{end}}({{.Condition}}) {
{{index $branch.RenderedBody}}
}{{end}}{{if .RenderedElseBody}} else {
{{.RenderedElseBody}}
}{{end}}
`

func convertIf(step map[string]interface{}, importStore *ImportStore) (string, error) {
	b, err := json.Marshal(step)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var iff If
	json.Unmarshal(b, &iff)
	fmt.Printf("%#v\n", iff)
	tmpl, err := template.New("iff").Parse(ifTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var renderedBranches []string

	for _, branch := range iff.Params.Branches {
		body, err := ConvertToCode(branch.Body, importStore)
		if err != nil {
			fmt.Println(err)
			return "", err
		}
		renderedBranches = append(renderedBranches, body)
	}

	var params struct {
		Branches []struct {
			Condition    string `json:"condition"`
			RenderedBody string `json:"renderedBody"`
		}
		RenderedElseBody string
	}

	for i, branch := range iff.Params.Branches {
		params.Branches = append(params.Branches, struct {
			Condition    string `json:"condition"`
			RenderedBody string `json:"renderedBody"`
		}{
			branch.Condition,
			renderedBranches[i],
		})
	}

	renderedElseBranch, err := ConvertToCode(iff.Params.ElseBranch, importStore)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	params.RenderedElseBody = renderedElseBranch

	var out bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	fmt.Println(out.String())
	return out.String(), nil
}
