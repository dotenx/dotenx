package executionService

import "log"

func (manager *executionManager) GetTaskId(executionId int, taskName string) (int, error) {
	pipelineVersionId, err := manager.Store.GetPipelineIdByExecution(noContext, executionId)
	if err != nil {
		log.Println("HAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHA")
		return -1, err
	}
	return manager.Store.GetTaskByPipelineId(noContext, pipelineVersionId, taskName)
}
