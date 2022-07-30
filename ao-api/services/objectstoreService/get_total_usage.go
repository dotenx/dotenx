package objectstoreService

import (
	"context"
)

func (ps *objectstoreService) GetTotalUsage(accountId string) (int, error) {
	size, err := ps.Store.GetTotalUsage(context.Background(), accountId)
	if err != nil {
		return 0, err
	}
	return size, nil
}
