package marketplaceService

import (
	"context"

	"encoding/json"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (ps *marketplaceService) GetComponentOfItem(id int) (models.ExportableUIComponent, error) {
	item, err := ps.Store.GetItem(context.Background(), id)
	if err != nil {
		return models.ExportableUIComponent{}, err
	}
	out, err := downloadFromS3(item.S3Key)
	if err != nil {
		logrus.Error(err.Error())
		return models.ExportableUIComponent{}, err
	}
	var project models.ExportableUIComponent
	err = json.Unmarshal(out, &project)
	return project, err
}
