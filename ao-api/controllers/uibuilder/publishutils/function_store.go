package publishutils

import (
	"bytes"
	"fmt"
	"strings"
	"sync"
	"text/template"
)

func NewFunctionStore() FunctionStore {
	return FunctionStore{
		Events: []Event{},
		lock:   new(sync.RWMutex),
	}
}

type FunctionStore struct {
	lock   *sync.RWMutex
	Events []Event
}

// Add the functionality to add new imports to the import store
func (i *FunctionStore) AddEvents(events []Event) {
	i.lock.Lock()
	defer i.lock.Unlock()

	i.Events = append(i.Events, events...)

	// print the events
	fmt.Println("events", i.Events)

}

func (i *FunctionStore) ConvertToHTML(dataSources []interface{}, globals []string) (string, error) {

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
	converted.WriteString(buf.String() + "\n")

	converted.WriteString(ds + "\n")
	converted.WriteString(out.String())

	mountSplider := `
document.addEventListener( 'DOMContentLoaded', function() {
	var splide = new Splide( '.splide' );
	splide.mount();
} );
`
	converted.WriteString("\n" + mountSplider) // TODO: mount splider only if there is a slider

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
