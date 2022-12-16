package crudService

func (cm *crudManager) SetInteractionAccess(pipelineId string, isPublic bool) (err error) {
	return cm.Store.SetInteractionAccess(pipelineId, isPublic)

}
