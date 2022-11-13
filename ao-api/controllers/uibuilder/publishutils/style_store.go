package publishutils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"sync"
	"text/template"
)

func NewStyleStore() StyleStore {
	return StyleStore{
		DesktopStyles: make(map[string]StyleModes),
		TabletStyles:  make(map[string]StyleModes),
		MobileStyles:  make(map[string]StyleModes),
		lock:          new(sync.RWMutex),
	}
}

type StyleModes struct {
	Default map[string]string `json:"default"`
	Hover   map[string]string `json:"hover"`
	Active  map[string]string `json:"active"`
}

type StyleStore struct {
	lock *sync.RWMutex

	DesktopStyles map[string]StyleModes
	TabletStyles  map[string]StyleModes
	MobileStyles  map[string]StyleModes
}

// Add the functionality to add new imports to the import store
func (i *StyleStore) AddStyle(id string, desktopStyles, tabletStyles, mobileStyles StyleModes) {
	i.lock.Lock()
	defer i.lock.Unlock()

	i.DesktopStyles[id] = desktopStyles
	i.TabletStyles[id] = tabletStyles
	i.MobileStyles[id] = mobileStyles

}

// a template to render all the imports

const importTemplate = `
*, *::before, *::after {
box-sizing: border-box;
}
* {
margin: 0;
}
html, body {
height: 100%;
}
body {
line-height: 1.5;
-webkit-font-smoothing: antialiased;
font-family: 'Roboto', sans-serif;
}
img, picture, video, canvas, svg {
display: block;
max-width: 100%;
}
input, button, textarea, select {
font: inherit;
}
p, h1, h2, h3, h4, h5, h6 {
overflow-wrap: break-word;
}
#root, #__next {
isolation: isolate;
}
{{range $id, $styles := .DesktopStyles}}{{if $styles}}
{{if $styles.Default}}#{{$id}} {
{{range $attr, $value := $styles.Default}}{{if $value}}{{$attr}}: {{$value}}{{end}};{{end}}
}{{end}}
{{if $styles.Hover}}#{{$id}}:hover {
{{range $attr, $value := $styles.Hover}}{{if $value}}{{$attr}}: {{$value}}{{end}};{{end}}
}{{end}}
{{if $styles.Active}}#{{$id}}:active {
{{range $attr, $value := $styles.Active}}{{if $value}}{{$attr}}: {{$value}}{{end}};{{end}}
}{{end}}
{{end}}{{end}}

@media (max-width: 767px) {
{{range $id, $styles := .TabletStyles}}{{if $styles}}
{{if $styles.Default}}#{{$id}} {
{{range $attr, $value := $styles.Default}}{{if $value}}{{$attr}}: {{$value}}{{end}};{{end}}
}{{end}}
{{if $styles.Hover}}#{{$id}}:hover {
{{range $attr, $value := $styles.Hover}}{{if $value}}{{$attr}}: {{$value}}{{end}};{{end}}
}{{end}}
{{if $styles.Active}}#{{$id}}:active {
{{range $attr, $value := $styles.Active}}{{if $value}}{{$attr}}: {{$value}}{{end}};{{end}}
}{{end}}
{{end}}{{end}}
}
@media (max-width: 478px) {
{{range $id, $styles := .MobileStyles}}{{if $styles}}
{{if $styles.Default}}#{{$id}} {
{{range $attr, $value := $styles.Default}}{{if $value}}{{$attr}}: {{$value}}{{end}};{{end}}
}{{end}}
{{if $styles.Hover}}#{{$id}}:hover {
{{range $attr, $value := $styles.Hover}}{{if $value}}{{$attr}}: {{$value}}{{end}};{{end}}
}{{end}}
{{if $styles.Active}}#{{$id}}:active {
{{range $attr, $value := $styles.Active}}{{if $value}}{{$attr}}: {{$value}}{{end}};{{end}}
}{{end}}
{{end}}{{end}}
}
`

func (i *StyleStore) ConvertToHTML(classNames map[string]interface{}) (string, error) {

	i.lock.RLock()
	defer i.lock.RUnlock()

	classes, err := convertClasses(classNames)
	if err != nil {
		return "", err
	}

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

	// We first render the classes and then inline styles
	return classes + out.String(), nil

}

func convertClasses(classNames map[string]interface{}) (string, error) {
	b, err := json.Marshal(classNames)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var tmp map[string]struct {
		Desktop StyleModes `json:"desktop"`
		Tablet  StyleModes `json:"tablet"`
		Mobile  StyleModes `json:"mobile"`
	}
	json.Unmarshal(b, &tmp)

	tmpStyleStore := NewStyleStore()
	for className, styles := range tmp {
		tmpStyleStore.AddStyle(className, styles.Desktop, styles.Tablet, styles.Mobile)
	}

	const classTemplate = `
	{{range $id, $styles := .DesktopStyles}}{{if $styles}}
	{{if $styles.Default}}.{{$id}} {
	{{range $attr, $value := $styles.Default}}{{if $value}}{{$attr}}: {{$value}}{{end}};{{end}}
	}{{end}}
	{{if $styles.Hover}}.{{$id}}:hover {
	{{range $attr, $value := $styles.Hover}}{{if $value}}{{$attr}}: {{$value}}{{end}};{{end}}
	}{{end}}
	{{if $styles.Active}}.{{$id}}:active {
	{{range $attr, $value := $styles.Active}}{{if $value}}{{$attr}}: {{$value}}{{end}};{{end}}
	}{{end}}
	{{end}}{{end}}
	
	@media (max-width: 767px) {
	{{range $id, $styles := .TabletStyles}}{{if $styles}}
	{{if $styles.Default}}.{{$id}} {
	{{range $attr, $value := $styles.Default}}{{if $value}}{{$attr}}: {{$value}}{{end}};{{end}}
	}{{end}}
	{{if $styles.Hover}}.{{$id}}:hover {
	{{range $attr, $value := $styles.Hover}}{{if $value}}{{$attr}}: {{$value}}{{end}};{{end}}
	}{{end}}
	{{if $styles.Active}}.{{$id}}:active {
	{{range $attr, $value := $styles.Active}}{{if $value}}{{$attr}}: {{$value}}{{end}};{{end}}
	}{{end}}
	{{end}}{{end}}
	}
	@media (max-width: 478px) {
	{{range $id, $styles := .MobileStyles}}{{if $styles}}
	{{if $styles.Default}}.{{$id}} {
	{{range $attr, $value := $styles.Default}}{{if $value}}{{$attr}}: {{$value}}{{end}};{{end}}
	}{{end}}
	{{if $styles.Hover}}.{{$id}}:hover {
	{{range $attr, $value := $styles.Hover}}{{if $value}}{{$attr}}: {{$value}}{{end}};{{end}}
	}{{end}}
	{{if $styles.Active}}.{{$id}}:active {
	{{range $attr, $value := $styles.Active}}{{if $value}}{{$attr}}: {{$value}}{{end}};{{end}}
	}{{end}}
	{{end}}{{end}}
	}
	`

	tmpl, err := template.New("classNames").Parse(classTemplate)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var out bytes.Buffer
	err = tmpl.Execute(&out, tmpStyleStore)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	fmt.Println(out.String())
	return out.String(), nil

}
