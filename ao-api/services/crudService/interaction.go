package crudService

import (
	"encoding/json"
	"errors"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (cm *crudManager) GetInteractionDetailes(accountId string, name string) (detailes []string, err error) {
	detailes = make([]string, 0)
	temp, _, _, _, isInteraction, err := cm.GetPipelineByName(accountId, name)
	if err != nil {
		return
	}
	if !isInteraction {
		return nil, errors.New("it is not a interaction")
	}
	for _, task := range temp.Manifest.Tasks {
		body := task.Body.(models.TaskBodyMap)
		for key, value := range body {
			var insertDt insertDto
			b, _ := json.Marshal(value)
			err := json.Unmarshal(b, &insertDt)
			if err == nil && insertDt.Key != "" && insertDt.Source != "" {
				if insertDt.Source == "interactionRunTime" {
					detailes = append(detailes, key)
				}
			}
		}
	}
	return
}
