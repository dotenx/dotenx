package crudService

import (
	"encoding/json"
	"errors"
	"strings"

	"github.com/dotenx/dotenx/ao-api/models"
)

// function to iterate over interaction tasks fields and if their soucre is interactionRunTime,
// we will pass them to fron to get them at run time
func (cm *crudManager) GetInteractionDetailes(accountId string, name, projectName string) (detailes map[string]interface{}, err error) {
	detailes = make(map[string]interface{})
	interaction, err := cm.GetPipelineByName(accountId, name, projectName)
	if err != nil {
		return
	}
	if !interaction.IsInteraction {
		return nil, errors.New("it is not a interaction")
	}
	for taskName, task := range interaction.PipelineDetailes.Manifest.Tasks {
		body := task.Body.(models.TaskBodyMap)
		fields := make([]map[string]interface{}, 0)
		for key, value := range body {
			var insertDt models.TaskFieldDetailes
			b, _ := json.Marshal(value)
			err := json.Unmarshal(b, &insertDt)
			if err == nil && insertDt.Type == models.NestedFieldType && strings.Contains(insertDt.NestedKey, "interactionRunTime") {
				// we should find the type of interactionRunTime field for rendering it on ui
				for _, f := range models.AvaliableTasks[task.Type].Fields {
					if f.Key == key {
						fields = append(fields, map[string]interface{}{
							"key":  key,
							"type": f.Type,
						})
						break
					}
				}
			}
		}
		if len(fields) > 0 {
			detailes[taskName] = fields
		}
	}
	return
}
