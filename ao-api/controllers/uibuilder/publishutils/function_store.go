package publishutils

import (
	"bytes"
	"fmt"
	"strings"
	"sync"
	"text/template"

	"github.com/sirupsen/logrus"
)

func NewFunctionStore() FunctionStore {
	return FunctionStore{
		lock:       new(sync.RWMutex),
		Events:     []Event{},
		Script:     make([]string, 0),
		ChartTypes: make(map[string]bool),
	}
}

type FunctionStore struct {
	lock       *sync.RWMutex
	Events     []Event
	Script     []string        // These are scripts that run inside a document.AddEventListener('alpine:init', function() { ... })
	ChartTypes map[string]bool // These are the chart types that are used in the page. We use this to know which renderChart functions to include
}

func (i *FunctionStore) AddChart(ChartType string, Effect string) {
	i.lock.Lock()
	defer i.lock.Unlock()

	i.ChartTypes[ChartType] = true
	i.Script = append(i.Script, Effect)
}

// Add the functionality to add new imports to the import store
func (i *FunctionStore) AddEvents(events []Event) {
	i.lock.Lock()
	defer i.lock.Unlock()

	i.Events = append(i.Events, events...)

	// print the events
	fmt.Println("events", i.Events)

}

func (i *FunctionStore) ConvertToHTML(dataSources []interface{}, globals []string, statesDefaultValues map[string]interface{}) (string, error) {

	i.lock.RLock()
	defer i.lock.RUnlock()

	var out strings.Builder
	for _, event := range i.Events {
		renderedEvent, err := convertEvent(event)
		if err != nil {
			return "", err
		}
		out.WriteString(renderedEvent + "\n")
	}

	ds, err := convertDataSources(dataSources)
	if err != nil {
		return "", err
	}

	var converted strings.Builder

	converted.WriteString(pageStore)

	tmpl, err := template.New("button").Parse(pageGlobals)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	params := struct {
		Globals []string
	}{
		Globals: globals,
	}
	var buf bytes.Buffer
	err = tmpl.Execute(&out, params)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return "", err
	}
	converted.WriteString("\n" + buf.String())

	converted.WriteString("\n" + ds)
	converted.WriteString("\n" + out.String())

	converted.WriteString("\n" + renderCharts(i.ChartTypes))

	convertedScripts, err := convertEffects(i.Script)
	if err != nil {
		logrus.Error(err)
		return "", err
	}
	converted.WriteString("\n" + convertedScripts)

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
    isOpen: Alpine.$persist(true),
    init() {
      {{range .Globals}}
      this['{{.}}'] = Alpine.$persist(null)
      {{end}}
    },
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

const pageStore = `
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
