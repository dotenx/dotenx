package onoffboardingService

import "github.com/utopiops/automated-ops/ao-api/models"

func (manager *onoffboardingManager) AddFlow(pipelineDto models.PipelineDto, base models.Pipeline, flowType models.FlowType, version int) error {
	manifest := pipelineDto.Manifest
	manifest.Triggers = make(map[string]models.Trigger) // Even if a trigger is specified in the dto, it's ignored.
	var triggerType models.TriggerType
	if flowType == OnBoarding {
		triggerType = models.OnBoarding
	} else {
		triggerType = models.OffBoarding
	}
	manifest.Triggers["start"] = models.Trigger{
		Type: triggerType,
	}

	pipeline := models.PipelineVersion{
		Manifest:       manifest,
		ServiceAccount: pipelineDto.ServiceAccount,
		FromVersion:    int16(version),
	}

	// create actually adds a pipeline version if `fromVersion` is non-zero
	return manager.Store.Create(noContext, &base, &pipeline)
}
