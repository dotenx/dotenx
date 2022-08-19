package uibuilder

import (
	"bytes"
	"fmt"
	"net/http"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cloudfront"
	"github.com/aws/aws-sdk-go/service/route53"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/controllers/uibuilder/publishutils"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

func (controller *UIbuilderController) PublishPage() gin.HandlerFunc {
	return func(c *gin.Context) {

		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}

		projectTag := c.Param("project_tag")
		pageName := c.Param("page_name")

		page, err := controller.Service.GetPage(accountId, projectTag, pageName)
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		html, scripts, styles, err := publishutils.RenderPage(page)
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		// Publish the page
		projectDomain, err := controller.ProjectService.GetProjectDomain(accountId, projectTag)
		if err != nil {
			if err.Error() == "project_domain not found" { // The project domain is created in this controller. If it doesn't exists, create it.
				projectDomain = models.ProjectDomain{
					AccountId:      accountId,
					ProjectTag:     projectTag,
					HostedZoneId:   "",
					TlsArn:         "",
					ExternalDomain: "",
					NsRecords:      []string{},
					InternalDomain: GetRandomName(10),
				}
				err = controller.ProjectService.UpsertProjectDomain(projectDomain)
				if err != nil {
					logrus.Error(err.Error())
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
			} else { // This is an internal server error
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}

		var bucket, prefix, domain string
		if projectDomain.TlsArn == "" { // We use TLS arn as an indicator that the external domain is verified and ready to be used
			// Ignore the external domain, try to publish with the internal domain

			// Copy the page and its dependencies to S3
			bucket = "water-static-qrpwasd239472lde2se348uuii8923n2" // TODO: Get from config
			prefix = projectDomain.InternalDomain + ".web" + "/"
			domain = projectDomain.InternalDomain + ".web.dotenx.com"
			err = CreateRoute53Record(projectDomain.InternalDomain+".web.dotenx.com", "d2hhdj7tyolioa.cloudfront.net", "Z10095473PHQIPQ1QOCMU", "CNAME") // TODO: Get from config
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

		} else {

			// get the status of cdn infra and if it's not ready, first deploy the cdn
			uiInfra, err := controller.Service.GetUiInfrastructure(accountId, projectTag)

			if err != nil {
				if err.Error() == "not found" { // The cdn infrastructure is not created, deploy it

					distributionArn, distributionDomainName, bucketName, err := createCloudFrontDistribution(projectDomain.ExternalDomain, projectDomain.TlsArn, projectTag)
					if err != nil {
						logrus.Error(err.Error())
						c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
						return
					}
					fmt.Println(distributionArn, distributionDomainName, bucketName)

					err = CreateRoute53Record(projectDomain.ExternalDomain, distributionDomainName, projectDomain.HostedZoneId, "Alias")
					if err != nil {
						logrus.Error(err.Error())
						c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
						return
					}
					bucket = bucketName
					prefix = ""

					uiInfra.AccountId = accountId
					uiInfra.ProjectTag = projectTag
					uiInfra.CdnArn = distributionArn
					uiInfra.CdnDomain = distributionDomainName
					uiInfra.S3Bucket = bucketName

					err = controller.Service.UpsertUiInfrastructure(uiInfra)
					if err != nil {
						logrus.Error(err.Error())
						c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
						return
					}
				} else { // This is an internal server error
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
			}

			domain = projectDomain.ExternalDomain

			bucket = uiInfra.S3Bucket
			prefix = ""
		}

		UploadFileToS3(bucket, []byte(html), prefix+pageName+".html", int64(len(html)), "text/html")
		UploadFileToS3(bucket, []byte(scripts), prefix+pageName+".js", int64(len(scripts)), "application/javascript")
		UploadFileToS3(bucket, []byte(styles), prefix+pageName+".css", int64(len(styles)), "text/css")

		if err := controller.Service.SetPageStatus(accountId, projectTag, pageName, "published"); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.JSON(http.StatusOK, gin.H{"url": "https://" + domain + "/" + pageName + ".html"})
	}
}

// Utility functions - not much business logic here
func UploadFileToS3(bucket string, fileBytes []byte, fileName string, size int64, contentType string) error {

	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := s3.New(session.New(), cfg)

	// Upload the file to S3
	_, err := svc.PutObject(&s3.PutObjectInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(fileName),
		Body:        bytes.NewReader(fileBytes),
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return err
	}

	return nil
}

func CreateRoute53Record(domain, value, hostedZoneId, recordType string) error {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := route53.New(session.New(), cfg)

	var resourceRecordSet *route53.ResourceRecordSet

	if recordType == "Alias" {
		resourceRecordSet = &route53.ResourceRecordSet{
			AliasTarget: &route53.AliasTarget{
				DNSName:              aws.String(value),
				EvaluateTargetHealth: aws.Bool(false),
				HostedZoneId:         aws.String("Z2FDTNDATAQYW2"), // CloudFront hosted zone id. Doesn't change
			},
			Name: aws.String(domain + "."),
			Type: aws.String("A"),
		}
	} else {
		resourceRecordSet = &route53.ResourceRecordSet{
			Name: aws.String(domain + "."),
			Type: aws.String("CNAME"),
			ResourceRecords: []*route53.ResourceRecord{
				{
					Value: aws.String(value),
				},
			},
			TTL: aws.Int64(300),
		}
	}
	upsert := []*route53.Change{{
		Action:            aws.String("UPSERT"),
		ResourceRecordSet: resourceRecordSet,
	}}

	// Put it into a pretty envelope with a stamp for route53#zoneId and change ticket
	params := route53.ChangeResourceRecordSetsInput{
		ChangeBatch: &route53.ChangeBatch{
			Changes: upsert,
		},
		HostedZoneId: aws.String(hostedZoneId),
	}

	// Post it
	_, err := svc.ChangeResourceRecordSets(&params)

	if err != nil {
		logrus.Error(err.Error())
	}
	return err
}

func createCloudFrontDistribution(domain, certificateArn, projectTag string) (distributionArn, distributionDomainName, bucketName string, err error) {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := s3.New(session.New(), cfg)

	// Create a bucket with a uuid name
	bucketName = uuid.New().String()
	_, err = svc.CreateBucket(&s3.CreateBucketInput{
		Bucket: aws.String(bucketName),
	})
	if err != nil {
		logrus.Error(err.Error())
		return
	}

	cfSvc := cloudfront.New(session.New(), cfg)

	// create origin access identity
	originAccessIdentity, err := cfSvc.CreateCloudFrontOriginAccessIdentity(&cloudfront.CreateCloudFrontOriginAccessIdentityInput{
		CloudFrontOriginAccessIdentityConfig: &cloudfront.OriginAccessIdentityConfig{
			CallerReference: aws.String(uuid.New().String()),
			Comment:         aws.String("Origin Access Identity for " + domain),
		},
	})

	// time.Sleep(time.Second * 10)
	fmt.Println("origin access identity: ", *originAccessIdentity.CloudFrontOriginAccessIdentity.Id)

	// Create a distribution with s3 origin and the origin access identity

	distributionConfig := &cloudfront.DistributionConfig{
		CallerReference: aws.String(projectTag),
		Comment:         aws.String(projectTag),
		Enabled:         aws.Bool(true),
		Origins: &cloudfront.Origins{
			Items: []*cloudfront.Origin{
				{
					DomainName: aws.String(bucketName + ".s3.amazonaws.com"),
					Id:         aws.String(bucketName),
					S3OriginConfig: &cloudfront.S3OriginConfig{
						OriginAccessIdentity: aws.String("origin-access-identity/cloudfront/" + *originAccessIdentity.CloudFrontOriginAccessIdentity.Id),
					},
				},
			},
			Quantity: aws.Int64(1),
		},
		DefaultCacheBehavior: &cloudfront.DefaultCacheBehavior{
			TargetOriginId:       aws.String(bucketName),
			ViewerProtocolPolicy: aws.String("redirect-to-https"),
			AllowedMethods: &cloudfront.AllowedMethods{
				Items: []*string{
					aws.String("GET"),
					aws.String("HEAD"),
					aws.String("OPTIONS"),
					aws.String("PUT"),
					aws.String("PATCH"),
					aws.String("POST"),
					aws.String("DELETE"),
				},
				Quantity: aws.Int64(7),
				CachedMethods: &cloudfront.CachedMethods{
					Items: []*string{
						aws.String("GET"),
						aws.String("HEAD"),
						aws.String("OPTIONS"),
					},
					Quantity: aws.Int64(3),
				},
			},
			Compress: aws.Bool(true),
			ForwardedValues: &cloudfront.ForwardedValues{
				QueryString: aws.Bool(true),
				Cookies: &cloudfront.CookiePreference{
					Forward: aws.String("all"),
				},
			},
			MinTTL: aws.Int64(0),
		},
		ViewerCertificate: &cloudfront.ViewerCertificate{
			ACMCertificateArn: aws.String(certificateArn),
			SSLSupportMethod:  aws.String("sni-only"),
		},

		DefaultRootObject: aws.String("index.html"),

		PriceClass: aws.String("PriceClass_100"),

		Aliases: &cloudfront.Aliases{
			Quantity: aws.Int64(1),
			Items: []*string{
				aws.String(domain),
				// todo: aws.String("www." + domain),
			},
		},

		CustomErrorResponses: &cloudfront.CustomErrorResponses{
			Quantity: aws.Int64(1),
			Items: []*cloudfront.CustomErrorResponse{
				{
					ErrorCode:        aws.Int64(404),
					ResponseCode:     aws.String("200"),
					ResponsePagePath: aws.String("/index.html"),
				},
			},
		},
	}
	res, err := cfSvc.CreateDistribution(&cloudfront.CreateDistributionInput{
		DistributionConfig: distributionConfig,
	})
	if err != nil {
		logrus.Error(err.Error())
		return
	}

	time.Sleep(time.Second * 10) // This MUST be here, otherwise the OAI is not ready yet

	distributionConfig = nil
	fmt.Println(distributionConfig)

	// get the distribution arn and the domain name
	distributionArn = *res.Distribution.ARN
	distributionDomainName = *res.Distribution.DomainName

	// Set the s3 bucket policy to allow access to the distribution with the origin access identity
	policy := fmt.Sprintf(`{
		"Version": "2012-10-17",
		"Statement": [
			{
					"Effect": "Allow",
					"Principal": {
						"AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity %s"
					},
					"Action": "s3:GetObject",
					"Resource": "arn:aws:s3:::%s/*"
			}
		]
		}`, *originAccessIdentity.CloudFrontOriginAccessIdentity.Id, bucketName)

	fmt.Println("policy: ", policy)

	bucketPolicy := &s3.PutBucketPolicyInput{
		Bucket: aws.String(bucketName),
		Policy: aws.String(policy),
	}

	_, err = svc.PutBucketPolicy(bucketPolicy)
	if err != nil {
		logrus.Error(err.Error())
		return
	}

	return

}
