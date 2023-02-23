package project

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/route53"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (pc *ProjectController) SetProjectExternalDomain() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)
		projectTag := c.Param("project_tag")
		dto := struct {
			ExternalDomain string `json:"externalDomain"`
		}{}
		if err := c.ShouldBindJSON(&dto); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}

		project, err := pc.Service.GetProjectByTag(projectTag)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		projectDomain, err := pc.Service.GetProjectDomain(accountId, projectTag)
		if err != nil {
			if err.Error() == "project_domain not found" { // The project domain is created in this controller too. If it doesn't exists, create it.

				hasAccess, err := pc.Service.CheckCreateDomainAccess(accountId, project.Type)
				if err != nil {
					logrus.Error(err.Error())
					c.JSON(http.StatusInternalServerError, gin.H{
						"error": err.Error(),
					})
					return
				}
				if !hasAccess {
					c.JSON(http.StatusBadRequest, gin.H{
						"message": utils.ErrReachLimitationOfPlan.Error(),
					})
					return
				}

				projectDomain = models.ProjectDomain{
					AccountId:      accountId,
					ProjectTag:     projectTag,
					HostedZoneId:   "",
					TlsArn:         "",
					NsRecords:      []string{},
					ExternalDomain: dto.ExternalDomain,
					InternalDomain: GetRandomName(10),
				}
				hostedZoneId, nsRecords, err := createHostedZone(dto.ExternalDomain)
				fmt.Println("hostedZoneId: ", hostedZoneId, nsRecords, len(hostedZoneId))
				if err != nil {
					logrus.Error(err.Error())
					c.AbortWithStatus(http.StatusInternalServerError)
					return
				}
				projectDomain.HostedZoneId = hostedZoneId
				projectDomain.NsRecords = nsRecords

			} else { // This is an internal server error
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}

		err = pc.Service.UpsertProjectDomain(projectDomain)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Status(http.StatusOK)
	}
}

func createHostedZone(externalDomain string) (string, []string, error) {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := route53.New(session.New(), cfg)

	input := &route53.CreateHostedZoneInput{
		Name:            aws.String(externalDomain),
		CallerReference: aws.String(externalDomain),
		HostedZoneConfig: &route53.HostedZoneConfig{
			Comment: aws.String("Created by dotenx"),
		},
	}
	result, err := svc.CreateHostedZone(input)
	if err != nil {
		return "", nil, err
	}
	nsRecords := make([]string, 0)
	for _, record := range result.DelegationSet.NameServers {
		nsRecords = append(nsRecords, *record)
	}

	hostedZoneId := strings.TrimLeft(*result.HostedZone.Id, "/hostedzone/")

	return hostedZoneId, nsRecords, nil
}
