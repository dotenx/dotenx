package publishutils

import (
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"text/template"

	"github.com/sirupsen/logrus"
)

func NewFunctionStore(animations []interface{}) (FunctionStore, error) {

	animationsToMap := func() (m map[string]Animation, err error) {
		m = make(map[string]Animation)
		for _, animationInterface := range animations {
			b, err := json.Marshal(animationInterface)
			if err != nil {
				return nil, err
			}
			var animation Animation
			err = json.Unmarshal(b, &animation)
			if err != nil {
				return nil, err
			}
			m[animation.Name] = animation
		}
		return
	}

	animationsMap, err := animationsToMap()
	if err != nil {
		logrus.Error(err.Error())
		return FunctionStore{}, err
	}

	return FunctionStore{
		lock:           new(sync.RWMutex),
		Events:         []Event{},
		Script:         make([]string, 0),
		ChartTypes:     make(map[string]bool),
		Extensions:     make([]string, 0),
		ExtensionHeads: make([]string, 0),
		Animations:     animationsMap,
	}, nil
}

type FunctionStore struct {
	lock           *sync.RWMutex
	Events         []Event
	Script         []string        // These are scripts that run inside a document.AddEventListener('alpine:init', function() { ... })
	ChartTypes     map[string]bool // These are the chart types that are used in the page. We use this to know which renderChart functions to include
	Extensions     []string        // These are the functions of the extensions and each of them run inside a separate document.AddEventListener('alpine:init', function() { ... })
	ExtensionHeads []string        // Each extension can have a head section that is added to the page. This holds the content of those heads.
	Animations     map[string]Animation
}

func (i *FunctionStore) AddChart(ChartType string, Effect string) {
	i.lock.Lock()
	defer i.lock.Unlock()

	i.ChartTypes[ChartType] = true
	i.Script = append(i.Script, Effect)
}

func (i *FunctionStore) AddEvents(events []Event) {
	i.lock.Lock()
	defer i.lock.Unlock()

	for _, event := range events {
		for _, action := range event.Actions {
			if action.Kind == "Animation" {
				action.AnimationOptions = i.Animations[action.AnimationName]
			}
		}
	}

	i.Events = append(i.Events, events...)
}

func (i *FunctionStore) AddExtension(extension string) {
	i.lock.Lock()
	defer i.lock.Unlock()

	i.Extensions = append(i.Extensions, extension)
}

func (i *FunctionStore) AddExtensionHead(extensionHead string) {
	i.lock.Lock()
	defer i.lock.Unlock()

	i.ExtensionHeads = append(i.ExtensionHeads, extensionHead)
}

func (i *FunctionStore) ConvertToHTML(dataSources []interface{}, globals []string, statesDefaultValues map[string]interface{}) (string, error) {

	i.lock.RLock()
	defer i.lock.RUnlock()

	var out, converted strings.Builder

	// page, url and global stores must be added first
	converted.WriteString(pageUrlStore)
	tmpl, err := template.New("page_globals").Parse(pageGlobals)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	params := struct {
		Globals []string
	}{
		Globals: globals,
	}
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}
	converted.WriteString("\n" + out.String())

	for _, event := range i.Events {
		renderedEvent, err := convertEvent(event)
		if err != nil {
			fmt.Println("error: ", err.Error())
			return "", err
		}
		converted.WriteString(renderedEvent + "\n")
	}

	ds, err := convertDataSources(dataSources)
	if err != nil {
		return "", err
	}
	converted.WriteString("\n" + ds)

	converted.WriteString("\n" + renderCharts(i.ChartTypes))

	convertedScripts, err := convertEffects(i.Script)
	if err != nil {
		logrus.Error(err)
		return "", err
	}
	converted.WriteString("\n" + convertedScripts)

	converted.WriteString("\n" + strings.Join(i.Extensions, "\n"))

	// Todo: Do this only if there is a slider!
	mountSplider := `
document.addEventListener( 'DOMContentLoaded', function() {
	try{
    var splide = new Splide( '.splide' );
	if(splide){splide.mount();}
  } catch(e){}
} );
`
	converted.WriteString("\n" + mountSplider) // TODO: mount splider only if there is a slider

	// We do this here because we want to make sure it's added after the functions that declare page and global stores
	convertedDefaultValues, err := convertStateDefaultValues(statesDefaultValues)
	if err != nil {
		logrus.Error(err)
		return "", err
	}
	converted.WriteString("\n" + convertedDefaultValues)

	return converted.String(), nil
}

const pageGlobals = `

document.addEventListener("alpine:init", () => {

  Alpine.store('global', {
    {{range .Globals}}
    {{.}}: Alpine.$persist(null),
    {{end}}
    set(name, value, key) {
      if (!key) {
        this[name] = value;
      } else {
        if (this[name]) {
          this[name][key] = value;
        } else {
          this[name] = {
            [key]: value
          };
        }
      }
    },
    toggle(name) {
      this[name] = !this[name];
    },
    push(name, value) {
      if (this[name]) {
        this[name].push(value);
      } else {
        this[name] = [value];
      }
    },
    removeElement(name, index) {
      if (this[name] && this[name].length > index) {
        this[name].splice(index, 1);
      }
    },
    inc(name, key) {
      if (!key) {
        if (this[name]) {
          this[name]++;
        } else {
          this[name] = 1;
        }
      } else {
        if (this[name]) {
          if (this[name][key]) {
            this[name][key]++;
          } else {
            this[name][key] = 1;
          }
        } else {
          this[name] = {
            [key]: 1
          };
        }
      }
    },
    dec(name, key) {
      if (!key) {
        if (this[name]) {
          this[name]--;
        } else {
          this[name] = -1;
        }
      } else {
        if (this[name]) {
          if (this[name][key]) {
            this[name][key]--;
          } else {
            this[name][key] = -1;
          }
        } else {
          this[name] = {
            [key]: -1
          };
        }
      }
    },
  })
})
`

const pageUrlStore = `
document.addEventListener("alpine:init", () => {

  Alpine.store('url', {
    init() {
      // Get the query string from the url and parse it
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      // loop through the params and add them to the store
      for (const [key, value] of urlParams) {
        this[key] = value;
      }
    }
  })

  Alpine.store('page', {
    set(name, value, key) {
      if (!key) {
        this[name] = value;
      } else {
        if (this[name]) {
          this[name][key] = value;
        } else {
          this[name] = {
            [key]: value
          };
        }
      }
    },
    toggle(name) {
      this[name] = !this[name];
    },
    push(name, value) {
      if (this[name]) {
        this[name].push(value);
      } else {
        this[name] = [value];
      }
    },
    removeElement(name, index) {
      if (this[name] && this[name].length > index) {
        this[name].splice(index, 1);
      }
    },
    inc(name, key) {
      if (!key) {
        if (this[name]) {
          this[name]++;
        } else {
          this[name] = 1;
        }
      } else {
        if (this[name]) {
          if (this[name][key]) {
            this[name][key]++;
          } else {
            this[name][key] = 1;
          }
        } else {
          this[name] = {
            [key]: 1
          };
        }
      }
    },
    dec(name, key) {
      if (!key) {
        if (this[name]) {
          this[name]--;
        } else {
          this[name] = -1;
        }
      } else {
        if (this[name]) {
          if (this[name][key]) {
            this[name][key]--;
          } else {
            this[name][key] = -1;
          }
        } else {
          this[name] = {
            [key]: -1
          };
        }
      }
    },
  })
})
`
