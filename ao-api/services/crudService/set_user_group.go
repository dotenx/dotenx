package crudService

func (cm *crudManager) SetUserGroups(pipelineId string, userGroups []string) (err error) {
	return cm.Store.SetUserGroups(pipelineId, userGroups)

}
