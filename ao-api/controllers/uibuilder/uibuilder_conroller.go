package uibuilder

import (
	"github.com/dotenx/dotenx/ao-api/services/projectService"
	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
)

type UIbuilderController struct {
	Service        uibuilderService.UIbuilderService
	ProjectService projectService.ProjectService
}
