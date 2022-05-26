package executionService

func (manager *executionManager) DeleteExecution(executionId int) error {
	return manager.Store.DeleteExecution(noContext, executionId)
}
