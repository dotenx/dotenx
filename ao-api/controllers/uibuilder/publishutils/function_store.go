package publishutils

import (
	"fmt"
	"strings"
	"sync"
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

func (i *FunctionStore) ConvertToHTML(dataSources []interface{}) (string, error) {

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
