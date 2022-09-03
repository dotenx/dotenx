package marketplaceService

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
)

func (ps *marketplaceService) AddItem(item models.MarketplaceItem, dbService databaseService.DatabaseService, cService crudService.CrudService) error {
	projectName := item.ProjectName

	// Get an exportable form of the project
	exportableProject, err := ps.ExportProject(item.AccountId, projectName, dbService, cService)
	if err != nil {
		return err
	}

	// Upload the project as a JSON file to S3
	item.S3Key = fmt.Sprintf("item_%s_project_%s", utils.GetNewUuid(), projectName)
	err = uploadProject(exportableProject, item.S3Key)
	if err != nil {
		return err
	}

	// Add the item to the marketplace
	return ps.Store.AddItem(context.Background(), item)
}

func uploadProject(project models.ProjectDto, fileName string) error {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := s3.New(session.New(), cfg)
	jsonBytes, err := json.Marshal(project)
	if err != nil {
		return err
	}
	reader := strings.NewReader(string(jsonBytes))

	// Upload the project to S3
	_, err = svc.PutObject(&s3.PutObjectInput{
		Bucket: aws.String(config.Configs.Upload.S3ProjectsBucket),
		Key:    aws.String(fileName),
		Body:   reader,
	})
	if err != nil {
		return err
	}
	return nil
}
