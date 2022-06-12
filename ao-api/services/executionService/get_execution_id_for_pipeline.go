package executionService

func (manager *executionManager) GetExecutionIdForPipeline(accountId, pipeLineName string) (int, error) {
	pipelineId, err := manager.Store.GetPipelineId(noContext, accountId, pipeLineName)
	if err != nil {
		return -1, err
	}
	return manager.Store.GetLastExecution(noContext, pipelineId)
}
