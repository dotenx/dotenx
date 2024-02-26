package projectService

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/acm"
	"github.com/aws/aws-sdk-go/service/cloudfront"
	"github.com/aws/aws-sdk-go/service/cloudwatchevents"
	"github.com/aws/aws-sdk-go/service/route53"
	"github.com/aws/aws-sdk-go/service/route53domains"
	"github.com/aws/aws-sdk-go/service/s3"
	awsScheduler "github.com/aws/aws-sdk-go/service/scheduler"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/uibuilderService"
	"github.com/sirupsen/logrus"
)

func (ps *projectService) DeleteProjectDomain(projectDomain models.ProjectDomain, ubService uibuilderService.UIbuilderService) error {
	// setup aws sdk config
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")
		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}

	err := ubService.DeleteAllPagesFromS3(projectDomain)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}

	// just for debugging
	logrus.Info("line 48")

	if projectDomain.ExternalDomain != "" {
		if projectDomain.PurchasedFromUs {

			// just for debugging
			logrus.Info("line 51")

			scheduleName := fmt.Sprintf("dtx_domain_registration_%s", projectDomain.ProjectTag)
			scheduleExist, err := EventBridgeScheduleExists(scheduleName)
			if err != nil {
				logrus.Error(err.Error())
				return err
			}
			if scheduleExist {

				// just for debugging
				logrus.Info("line 62")

				// send a request to dotenx-admin for canceling subscription
				dto := BuyDomainDto{
					AccountId:  projectDomain.AccountId,
					ProjectTag: projectDomain.ProjectTag,
					DomainName: projectDomain.ExternalDomain,
				}
				json_data, err := json.Marshal(dto)
				if err != nil {
					err = errors.New("bad input body")
					logrus.Error(err.Error())
					return err
				}
				requestBody := bytes.NewBuffer(json_data)
				token, err := utils.GeneratToken()
				if err != nil {
					logrus.Error(err.Error())
					return err
				}
				Requestheaders := []utils.Header{
					{
						Key:   "Authorization",
						Value: token,
					},
					{
						Key:   "Content-Type",
						Value: "application/json",
					},
				}
				httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
				url := config.Configs.Endpoints.Admin + "/internal/subscription/domain/cancel"
				_, err, status, _ := httpHelper.HttpRequest(http.MethodPost, url, requestBody, Requestheaders, time.Minute, true)
				if err != nil {
					logrus.Error(err.Error())
					return err
				}
				if status != http.StatusOK && status != http.StatusAccepted {
					err = errors.New("not ok with status: " + strconv.Itoa(status))
					logrus.Error(err.Error())
					return err
				}

				// just for debugging
				logrus.Info("line 106")

				// Delete event bridge schedule
				schedulerSvc := awsScheduler.New(session.New(), cfg)
				_, err = schedulerSvc.DeleteSchedule(&awsScheduler.DeleteScheduleInput{
					Name: aws.String(scheduleName),
				})
				if err != nil {
					logrus.Error("Error occurred while deleting EventBridge schedule:", err.Error())
					return err
				}

				// just for debugging
				logrus.Info("line 119")
			}

			if projectDomain.RegistrationStatus == "SUCCESSFUL" {

				// just for debugging
				logrus.Info("line 125")

				// Disable domain auto-renew in aws route53domains
				route53domainsSvc := route53domains.New(session.New(), cfg)
				_, err = route53domainsSvc.DisableDomainAutoRenew(&route53domains.DisableDomainAutoRenewInput{
					DomainName: aws.String(projectDomain.ExternalDomain),
				})
				if err != nil {
					logrus.Error("Error occurred while disabling domain auto-renew:", err.Error())
					return err
				}

				// just for debugging
				logrus.Info("line 138")
			}
		}

		ruleName := fmt.Sprintf("dtx_certificate_issuance_%s", projectDomain.ProjectTag)
		ruleExist, err := EventBridgeRuleExists(ruleName)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
		if ruleExist {

			// just for debugging
			logrus.Info("line 151")

			// Delete event bridge rule
			eventBridgeSvc := cloudwatchevents.New(session.New(), cfg)
			_, err = eventBridgeSvc.RemoveTargets(&cloudwatchevents.RemoveTargetsInput{
				Ids:  []*string{aws.String("sns_topic")},
				Rule: aws.String(ruleName),
			})
			if err != nil {
				logrus.Error("Error occurred while removing event bridge rule target(s):", err.Error())
				return err
			}
			_, err = eventBridgeSvc.DeleteRule(&cloudwatchevents.DeleteRuleInput{
				Name: aws.String(ruleName),
			})
			if err != nil {
				logrus.Error("Error occurred while deleting event bridge rule:", err.Error())
				return err
			}

			// just for debugging
			logrus.Info("line 164")
		}

		if projectDomain.CertificateIssued {

			// just for debugging
			logrus.Info("line 170")

			// Delete cloud front distribution
			cfSvc := cloudfront.New(session.New(), cfg)
			distributionArn := projectDomain.CdnArn
			parts := strings.Split(distributionArn, "/")
			distributionId := parts[len(parts)-1]
			dist, err := cfSvc.GetDistribution(&cloudfront.GetDistributionInput{
				Id: aws.String(distributionId),
			})
			if err != nil {
				logrus.Error("Error occurred while getting cloud front distribution:", err.Error())
				return err
			}
			newDistConfig := dist.Distribution.DistributionConfig
			newDistConfig.Enabled = aws.Bool(false)
			_, err = cfSvc.UpdateDistribution(&cloudfront.UpdateDistributionInput{
				DistributionConfig: newDistConfig,
				Id:                 aws.String(distributionId),
				IfMatch:            dist.ETag,
			})
			if err != nil {
				logrus.Error("Error occurred while disabling cloud front distribution:", err.Error())
				return err
			}

			done := make(chan bool)
			go tryToDeleteCloudFrontDistribution(cfSvc, distributionId, *dist.ETag, done)
			// _, err = cfSvc.DeleteDistribution(&cloudfront.DeleteDistributionInput{
			// 	Id:      aws.String(distributionId),
			// 	IfMatch: dist.ETag,
			// })
			// if err != nil {
			// 	logrus.Error("Error occurred while deleting cloud front distribution:", err.Error())
			// 	return err
			// }

			// just for debugging
			logrus.Info("line 194")

			// Delete S3 Bucket
			s3Svc := s3.New(session.New(), cfg)
			_, err = s3Svc.DeleteBucket(&s3.DeleteBucketInput{
				Bucket: aws.String(projectDomain.S3Bucket),
			})
			if err != nil {
				logrus.Error("Error occurred while deleting S3 Bucket:", err.Error())
				return err
			}

			// just for debugging
			logrus.Info("line 207")
		}

		if projectDomain.TlsArn != "" {

			// just for debugging
			logrus.Info("line 213")

			// Delete certificate
			acmSvc := acm.New(session.New(), cfg)
			_, err = acmSvc.DeleteCertificate(&acm.DeleteCertificateInput{
				CertificateArn: aws.String(projectDomain.TlsArn),
			})
			if err != nil {
				logrus.Error("Error occurred while deleting certificate:", err.Error())
				return err
			}

			// just for debugging
			logrus.Info("line 226")
		}

		// if !projectDomain.PurchasedFromUs && projectDomain.HostedZoneId != "" {
		if projectDomain.HostedZoneId != "" {

			// just for debugging
			logrus.Info("line 233")

			// Delete all records from hosted zone to prepare itslef for deletion
			if projectDomain.HostedZoneId != "" {
				err = utils.DeleteAllResourceRecordSets(projectDomain.HostedZoneId)
				if err != nil {
					logrus.Error("Error occurred while deleting all route53 records:", err.Error())
					return err
				}
			}

			// just for debugging
			logrus.Info("line 245")

			// Delete hosted zone
			route53Svc := route53.New(session.New(), cfg)
			_, err := route53Svc.DeleteHostedZone(&route53.DeleteHostedZoneInput{
				Id: aws.String(projectDomain.HostedZoneId),
			})
			if err != nil {
				logrus.Error("Error occurred while deleting hosted zone:", err.Error())
				return err
			}

			// just for debugging
			logrus.Info("line 258")
		}

		// just for debugging
		logrus.Info("line 262")
	}

	return ps.Store.DeleteProjectDomain(context.Background(), projectDomain)
}

func tryToDeleteCloudFrontDistribution(cfService *cloudfront.CloudFront, distributionId, ETag string, done chan bool) {

	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	endTime := time.Now().Add(30 * time.Minute)

	for {
		select {
		case <-ticker.C:
			_, err := cfService.DeleteDistribution(&cloudfront.DeleteDistributionInput{
				Id:      aws.String(distributionId),
				IfMatch: aws.String(ETag),
			})
			if err != nil {
				logrus.Error("Error occurred while deleting cloud front distribution:", err.Error())
			} else {
				logrus.Printf("Cloud Front Distribution with this id was deleted: %s", distributionId)
				done <- true
				return
			}

			if time.Now().After(endTime) {
				done <- true
				return
			}
		}
	}

}
