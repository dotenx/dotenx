package objectstoreService

import "context"

func (ps *objectstoreService) GetUsageByProjectType(accountId, projectType string) (int64, error) {
	size, err := ps.Store.GetUsageByProjectType(context.Background(), accountId, projectType)
	if err != nil {
		return 0, err
	}
	return size, nil
}
