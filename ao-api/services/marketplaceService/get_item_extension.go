package marketplaceService

import (
	"context"
	"encoding/json"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (ps *marketplaceService) GetExtensionOfItem(id int) (models.ExportableUIExtension, error) {
	item, err := ps.Store.GetItem(context.Background(), id)
	if err != nil {
		return models.ExportableUIExtension{}, err
	}
	out, err := downloadFromS3(item.S3Key)
	if err != nil {
		logrus.Error(err.Error())
		return models.ExportableUIExtension{}, err
	}
	var extension models.ExportableUIExtension
	err = json.Unmarshal(out, &extension)
	return extension, err
}
