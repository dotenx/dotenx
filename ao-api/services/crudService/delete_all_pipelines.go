package crudService

import "context"

func (cm *crudManager) DeleteAllPipelines(accountId, projectName string) (err error) {
	return cm.Store.DeleteAllPipelines(context.Background(), accountId, projectName)
}
