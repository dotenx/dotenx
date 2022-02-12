package onoffboardingService

import (
	"log"

	"github.com/utopiops/automated-ops/ao-api/models"
)

func (m *onoffboardingManager) GetList(accountId string, flowType models.FlowType) ([]models.WorkspacePipelineSummaryDto, error) {
	var pipelines []models.WorkspacePipelineSummary
	var err error
	if flowType == OnBoarding {
		pipelines, err = m.Store.ListOffBoardingPipelines(noContext, accountId)
	} else {
		pipelines, err = m.Store.ListOffBoardingPipelines(noContext, accountId)
	}
	if err != nil {
		log.Println(err.Error())
		return nil, err
	}

	result := make([]models.WorkspacePipelineSummaryDto, len(pipelines))
	for idx, p := range pipelines {
		var version int64 = -1
		if pipelines[idx].ActiveVersion.Valid {
			version = p.ActiveVersion.Int64
		}
		result[idx] = models.WorkspacePipelineSummaryDto{
			Name:          p.Name,
			ActiveVersion: version,
		}
	}
	return result, nil
}
