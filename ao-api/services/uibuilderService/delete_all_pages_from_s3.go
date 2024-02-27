package uibuilderService

import (
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

func (ps *uibuilderService) DeleteAllPagesFromS3(projectDomain models.ProjectDomain) (err error) {

	var bucket, prefix string
	if !projectDomain.CertificateIssued { // We use certificate issuance status as an indicator that the external domain is verified and ready to be used or not
		bucket = config.Configs.UiBuilder.S3Bucket
		prefix = projectDomain.InternalDomain + ".web" + "/"
	} else {
		bucket = projectDomain.S3Bucket
		prefix = "/"
	}
	err = utils.DeleteS3Folder(bucket, prefix)
	if err != nil {
		logrus.Error(err.Error())
		return
	}

	return
}
