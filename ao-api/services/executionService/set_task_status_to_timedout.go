package executionService

func (manager *executionManager) SetTaskStatusToTimedout(executionId, taskId int) error {
	return manager.Store.SetTaskStatusToTimedout(noContext, executionId, taskId)
}
