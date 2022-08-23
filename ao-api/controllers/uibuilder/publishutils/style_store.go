package publishutils

import (
	"bytes"
	"fmt"
	"sync"
	"text/template"
)

func NewStyleStore() StyleStore {
	return StyleStore{
		// Imports: make([]string, 0),
		DesktopStyles: make(map[string]map[string]string),
		TabletStyles:  make(map[string]map[string]string),
		MobileStyles:  make(map[string]map[string]string),
		lock:          new(sync.RWMutex),
	}
}

type StyleStore struct {
	lock *sync.RWMutex

	DesktopStyles map[string]map[string]string
	TabletStyles  map[string]map[string]string
	MobileStyles  map[string]map[string]string
}

// Add the functionality to add new imports to the import store
func (i *StyleStore) AddStyle(id string, desktopStyles, tabletStyles, mobileStyles map[string]string) {
	i.lock.Lock()
	defer i.lock.Unlock()

	i.DesktopStyles[id] = desktopStyles
	i.TabletStyles[id] = tabletStyles
	i.MobileStyles[id] = mobileStyles

}

// a template to render all the imports

const importTemplate = `@media (max-width: 1234px) {
{{range $id, $styles := .DesktopStyles}}{{if $styles}}
#{{$id}} {
{{range $attr, $value := $styles}}{{$attr}}: {{$value}};{{end}}
}{{end}}{{end}}
}
@media (max-width: 774px) {
{{range $id, $styles := .TabletStyles}}{{if $styles}}#{{$id}} {
		{{range $attr, $value := $styles}}{{$attr}}: {{$value}};{{end}}
}{{end}}{{end}}
}
@media (max-width: 500px) {
{{range $id, $styles := .MobileStyles}}{{if $styles}}#{{$id}} {
{{range $attr, $value := $styles}}{{$attr}}: {{$value}};{{end}}
}{{end}}{{end}}
}
`

func (i *StyleStore) ConvertToHTML() (string, error) {

	i.lock.RLock()
	defer i.lock.RUnlock()

	// fmt.Printf("%#v\n", i.Imports)

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
