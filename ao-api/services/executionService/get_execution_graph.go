package executionService

import (
	"log"
	"net/http"

	"github.com/utopiops/automated-ops/ao-api/models"
)

func (manage *executionManager) GetExecutionGraph(executionId int, accountId string) (interface{}, int) {
	pipeline, name, err := manage.Store.GetExecutionGraph(noContext, executionId, accountId)
	if err != nil {
		if err.Error() == "Not found" {
			return nil, http.StatusNotFound
		}
		log.Println(err.Error())
		return nil, http.StatusInternalServerError
	}
	output := struct {
		PipelineVersion models.PipelineVersion `json:"pipeline" yaml:"pipeline"`
		Name            string                 `json:"name" yaml:"name"`
	}{pipeline, name}
	return output, http.StatusOK
}
