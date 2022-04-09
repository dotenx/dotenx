package executionService

import (
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
		log.Println(accountId)
		log.Println(err.Error())
		if err.Error() == "pipeline not found" {
			//return -1, http.StatusBadRequest
			return -1, err
		}
		//return -1, http.StatusInternalServerError
		return -1, err
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
