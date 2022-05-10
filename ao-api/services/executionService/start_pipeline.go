package executionService

import (
	"errors"
	"log"
	"time"

	"github.com/dotenx/dotenx/ao-api/models"
)

/*	Note: based on this implementation always the latest activated version will be executed. If you want to
	execute specific version you need to get the version as another parameter and feed it to the GetActivatedPipelineVersionIdByEndpoint
	but you would let people to execute inactive versions (current assumption is there is only one active version at any given time).
	Current approach doesn't match the cases like the build pipelines in repositories where you have particular pipeline per git push
	and at any time you are able to re-run it.
*/

func (manager *executionManager) StartPipeline(input map[string]interface{}, accountId, endpoint string) (int, error) {
	pipelineId, err := manager.Store.GetPipelineIdByEndpoint(noContext, accountId, endpoint)
	if err != nil {
		log.Println(err.Error())
		if err.Error() == "pipeline not found" {
			//return -1, http.StatusBadRequest
			return -1, err
		}
		//return -1, http.StatusInternalServerError
		return -1, err
	}
	name, err := manager.Store.GetPipelineNameById(noContext, accountId, pipelineId)
	if err != nil {
		return -1, err
	}
	_, _, isActive, err := manager.Store.GetByName(noContext, accountId, name)
	if err != nil {
		return -1, err
	}
	if !isActive {
		return -1, errors.New("automation is not active")
	}
	hasAccess, err := manager.CheckAccess(accountId, "executionMinutes", pipelineId)
	if err != nil {
		return -1, err
	}
	if !hasAccess {
		return -1, errors.New("you have reached your limit")
	}
	execution := models.Execution{
		PipelineVersionId: pipelineId,
		StartedAt:         time.Now(),
		InitialData:       input,
	}

	executionId, err := manager.Store.CreateExecution(noContext, execution)
	if err != nil {
		log.Println(err.Error())
		return -1, err
	}

	err = manager.QueueService.AddUser(accountId)
	if err != nil {
		return -1, err
	}
	err = manager.GetNextTask(-1, executionId, "", accountId)
	if err != nil {
		return -1, err
	}
	return executionId, nil
}
