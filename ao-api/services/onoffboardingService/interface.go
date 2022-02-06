package onoffboardingService

import (
	"context"

	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/stores/pipelineStore"
)

type OnoffboardingService interface {
	AddFlow(pipelineDto models.PipelineDto, base models.Pipeline, flowType models.FlowType, version int) error
	GetList(accountId string, flowType models.FlowType) ([]models.WorkspacePipelineSummaryDto, error)
}

type onoffboardingManager struct {
	Store pipelineStore.PipelineStore
}

func NewOnofboardingService(store pipelineStore.PipelineStore) OnoffboardingService {
	return &onoffboardingManager{Store: store}
}

const (
	// OnBoarding indicates a flow is an on-boarding
	OnBoarding models.FlowType = 0
	// OffBoarding indicates a flow is an off-boarding
	OffBoarding
)

var noContext = context.Background()
