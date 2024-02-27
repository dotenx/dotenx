package uibuilderService

import (
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

func (ps *uibuilderService) DeleteAllPagesFromS3(projectDomain models.ProjectDomain) (err error) {

	pages, err := ps.ListPages(projectDomain.AccountId, projectDomain.ProjectTag)
	if err != nil {
		logrus.Error(err.Error())
		return
	}

	for _, pageName := range pages {
		var bucket, prefix string
		if !projectDomain.CertificateIssued { // We use certificate issuance status as an indicator that the external domain is verified and ready to be used or not
			bucket = config.Configs.UiBuilder.S3Bucket
			prefix = projectDomain.InternalDomain + ".web" + "/"
		} else {
			bucket = projectDomain.S3Bucket
			prefix = ""
		}
		fileExtensions := []string{".html", ".css", ".js"}
		for _, ext := range fileExtensions {
			fileName := prefix + pageName + ext
			err = utils.DeleteObject(bucket, fileName)
			if err != nil {
				logrus.Error(err.Error())
				return
			}
		}
	}

	return
}
