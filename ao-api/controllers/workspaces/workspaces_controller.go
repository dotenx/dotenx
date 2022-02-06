package workspaces

import "github.com/utopiops/automated-ops/ao-api/services/workspacesService"

type WorkspacesController struct {
	Servicee workspacesService.WorkspaceService
}
