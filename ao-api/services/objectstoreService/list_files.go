package objectstoreService

import (
	"context"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (ps *objectstoreService) ListFiles(accountId, projectTag string) ([]models.Objectstore, error) {
	list, err := ps.Store.ListFiles(context.Background(), accountId, projectTag)
	if err != nil {
		logrus.Error(err.Error())
		return nil, err
	}
	return list, nil
}
