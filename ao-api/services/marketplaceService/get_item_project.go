package marketplaceService

import (
	"context"
	"io/ioutil"

	"encoding/json"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/sirupsen/logrus"
)

func (ps *marketplaceService) GetProjectOfItem(id int) (models.ProjectDto, error) {
	item, err := ps.Store.GetItem(context.Background(), id)
	if err != nil {
		return models.ProjectDto{}, err
	}
	return downloadProject(item.S3Key)
}

func downloadProject(fileName string) (models.ProjectDto, error) {

	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := s3.New(session.New(), cfg)

	response, err := svc.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(config.Configs.Upload.S3ProjectsBucket),
		Key:    aws.String(fileName),
	})
	if err != nil {
		logrus.Error(err.Error())
		return models.ProjectDto{}, err
	}
	out, err := ioutil.ReadAll(response.Body)
	if err != nil {
		logrus.Error(err.Error())
		return models.ProjectDto{}, err
	}
	var project models.ProjectDto

	err = json.Unmarshal(out, &project)
	return project, err
}
