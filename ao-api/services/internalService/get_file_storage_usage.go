package internalService

func (ps *internalService) GetFileStorageUsage(accountId, projectType string) (int64, error) {
	return ps.ObjectstoreService.GetUsageByProjectType(accountId, projectType)
}
