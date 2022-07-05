package crudService

import (
	"encoding/json"
	"errors"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
)

// function to iterate over interaction tasks fields and if their soucre is interactionRunTime,
// we will pass them to fron to get them at run time
func (cm *crudManager) GetInteractionDetailes(accountId string, name string) (detailes map[string]interface{}, err error) {
	detailes = make(map[string]interface{})
	interaction, err := cm.GetPipelineByName(accountId, name)
	if err != nil {
		return
	}
	if !interaction.IsInteraction {
		return nil, errors.New("it is not a interaction")
	}
	for taskName, task := range interaction.PipelineDetailes.Manifest.Tasks {
		body := task.Body.(models.TaskBodyMap)
		fields := make([]string, 0)
		for key, value := range body {
			var insertDt insertDto
			b, _ := json.Marshal(value)
			err := json.Unmarshal(b, &insertDt)
			if err == nil && insertDt.Key != "" && insertDt.Source == config.Configs.App.InteractionBodyKey {
				fields = append(fields, key)
			}
		}
		if len(fields) > 0 {
			detailes[taskName] = fields
		}
	}
	return
}
