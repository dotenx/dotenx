package publishutils

import (
	"bytes"
	"fmt"
	"sync"
	"text/template"
)

func NewFunctionStore() FunctionStore {
	return FunctionStore{
		Functions: make(map[string]map[string]string),
		lock:      new(sync.RWMutex),
	}
}

type FunctionStore struct {
	lock      *sync.RWMutex
	Functions map[string]map[string]string
}

// Add the functionality to add new imports to the import store
func (i *FunctionStore) AddFunction(id, event, code string) {
	i.lock.Lock()
	defer i.lock.Unlock()

	// check if the event is already in the map
	if _, ok := i.Functions[id]; !ok {
		i.Functions[id] = make(map[string]string)
	}
	i.Functions[id][event] = code

}

// a template to render all the imports

const functionsTemplate = `{{range $id, $functions := .Functions}}{{range $event, $code := $functions}}
document.getElementById("{{$id}}").addEventListener("{{$event}}", {{$id}}_{{$event}});
function {{$id}}_{{$event}}(event) {
	{{$code}}
}{{end}}{{end}}`

func (i *FunctionStore) ConvertToHTML() (string, error) {

	i.lock.RLock()
	defer i.lock.RUnlock()

	tmpl, err := template.New("import").Parse(functionsTemplate)
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
