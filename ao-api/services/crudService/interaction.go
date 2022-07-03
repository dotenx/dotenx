package crudService

import (
	"encoding/json"
	"errors"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (cm *crudManager) GetInteractionDetailes(accountId string, name string) (detailes map[string]interface{}, err error) {
	detailes = make(map[string]interface{})
	temp, _, _, _, isInteraction, err := cm.GetPipelineByName(accountId, name)
	if err != nil {
		return
	}
	if !isInteraction {
		return nil, errors.New("it is not a interaction")
	}
	for taskName, task := range temp.Manifest.Tasks {
		body := task.Body.(models.TaskBodyMap)
		fields := make([]string, 0)
		for key, value := range body {
			var insertDt insertDto
			b, _ := json.Marshal(value)
			err := json.Unmarshal(b, &insertDt)
			if err == nil && insertDt.Key != "" && insertDt.Source != "" {
				if insertDt.Source == "interactionRunTime" {
					fields = append(fields, key)
				}
			}
		}
		if len(fields) > 0 {
			detailes[taskName] = fields
		}
	}
	return
}
