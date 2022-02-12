package workspacesService

import (
	"log"
	"net/http"

	"github.com/utopiops/automated-ops/ao-api/models"
)

func (manager *workspaceManager) GetFlowByVersion(version int16, accountId, name string) (interface{}, int) {
	pipeline, _, err := manager.Store.GetByVersion(noContext, version, accountId, name)
	if err != nil {
		if err.Error() == "Not found" {
			return nil, http.StatusNotFound
		}
		log.Println(err.Error())
		return nil, http.StatusInternalServerError
	}

	output := struct {
		ServiceAccount string `yaml:"serviceAccount,omitempty"`
		Manifest       models.Manifest
	}{
		pipeline.ServiceAccount,
		pipeline.Manifest,
	}
	return output, http.StatusOK
}
