package miniTasks

import (
	"bytes"
	"fmt"
	"sync"
	"text/template"
)

func NewImportStore() ImportStore {
	return ImportStore{
		// Imports: make([]string, 0),
		Imports: make(map[string]string),
		lock:    new(sync.RWMutex),
	}
}

type ImportStore struct {
	lock *sync.RWMutex
	// Imports []string
	Imports map[string]string
}

// Add the functionality to add new imports to the import store
func (i *ImportStore) AddImport(toImport string) {
	i.lock.Lock()
	defer i.lock.Unlock()
	fmt.Println("Adding import: " + toImport)
	// i.Imports = append(i.Imports, toImport)
	i.Imports[toImport] = toImport

	fmt.Printf("==========> %#v\n", i.Imports)

}

// a template to render all the imports

const importTemplate = `{{range .Imports}}var {{.}}=require("/function/{{.}}")
{{end}}`

func (i *ImportStore) ToCode() (string, error) {

	i.lock.RLock()
	defer i.lock.RUnlock()

	fmt.Printf("%#v\n", i.Imports)

	tmpl, err := template.New("import").Parse(importTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	var out bytes.Buffer
	err = tmpl.Execute(&out, i)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	fmt.Println(out.String())
	return out.String(), nil
}
