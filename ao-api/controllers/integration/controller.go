package integration

import (
	"github.com/dotenx/dotenx/ao-api/services/integrationService"
	"github.com/dotenx/dotenx/ao-api/services/oauthService"
)

type IntegrationController struct {
	Service      integrationService.IntegrationService
	OauthService oauthService.OauthService
}
