package executionService

import (
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
)

func (manager *executionManager) GetInitialData(executionId int, accountId string) (models.InputData, int) {
	output, err := manager.Store.GetInitialData(noContext, executionId, accountId)
	if err != nil {
		if err.Error() == "Not found" {
			return nil, http.StatusNotFound
		}
		log.Println(err.Error())
		return nil, http.StatusInternalServerError
	}
	return output, http.StatusOK
}
