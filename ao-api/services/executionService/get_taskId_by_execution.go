package executionService

func (manager *executionManager) GetTaskId(executionId int, taskName string) (int, error) {
	pipelineVersionId, err := manager.Store.GetPipelineVersionId(noContext, executionId)
	if err != nil {
		return -1, err
	}
	return manager.Store.GetTaskByPipelineVersionId(noContext, pipelineVersionId, taskName)
}
