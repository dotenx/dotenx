package oauthController

import (
	"github.com/dotenx/dotenx/ao-api/services/integrationService"
	"github.com/dotenx/dotenx/ao-api/services/oauthService"
)

type OauthController struct {
	Service            oauthService.OauthService
	IntegrationService integrationService.IntegrationService
}
