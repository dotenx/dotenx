package onoffboarding

import (
	"github.com/utopiops/automated-ops/ao-api/models"
	"github.com/utopiops/automated-ops/ao-api/services/onoffboardingService"
)

// Controller is the controller to wrap the on/off boarding specific pipelines' functionalities.
type Controller struct {
	Service onoffboardingService.OnoffboardingService
}

// FlowType indicates the type of boarding flow

const (
	// OnBoarding indicates a flow is an on-boarding
	OnBoarding models.FlowType = 0
	// OffBoarding indicates a flow is an off-boarding
	OffBoarding
)
