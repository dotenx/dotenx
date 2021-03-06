package executionService

func (manager *executionManager) GetNumberOfTasksByExecution(executionId int) (int, error) {
	pipelineVersionId, err := manager.Store.GetPipelineIdByExecution(noContext, executionId)
	if err != nil {
		return -1, err
	}
	return manager.Store.GetNumberOfTasksForPipeline(noContext, pipelineVersionId)
}
