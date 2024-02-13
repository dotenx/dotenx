package projectService

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cloudfront"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

func (ps *projectService) HandleCertificateIssuance(certificateArnList []string) (err error) {
	errCerts := make([]string, 0)
	for _, certArn := range certificateArnList {
		errOccurred := false
		projectDomain, getDomainErr := ps.Store.GetProjectDomainByCertificateArn(context.Background(), certArn)
		if getDomainErr != nil {
			logrus.Info(certArn)
			logrus.Error(getDomainErr.Error())
			// we move forward for the next certificates because we don't want to lose the
			errOccurred = true
			continue
		}

		// Create the CloudFront distribution
		distributionArn, distributionDomainName, bucketName, cfdErr := createCloudFrontDistribution(projectDomain.ExternalDomain, projectDomain.TlsArn, projectDomain.ProjectTag)
		if cfdErr != nil {
			logrus.Error(cfdErr.Error())
			// we move forward for the next certificates because we don't want to lose the
			errOccurred = true
			continue
		}

		projectDomain.CdnArn = distributionArn
		projectDomain.CdnDomain = distributionDomainName
		projectDomain.S3Bucket = bucketName
		projectDomain.CertificateIssued = true

		err = ps.UpsertProjectDomain(projectDomain)
		if err != nil {
			logrus.Error(err.Error())
			// we move forward for the next certificates because we don't want to lose the
			errOccurred = true
			continue
		}

		// add the A (Alias) record to point to the CloudFront distribution we just created
		err = utils.UpsertRoute53Record(projectDomain.ExternalDomain, distributionDomainName, projectDomain.HostedZoneId, "Alias")
		if err != nil {
			logrus.Error(err.Error())
			// we move forward for the next certificates because we don't want to lose the
			errOccurred = true
			continue
		}

		// If the project is published with dotenx domain, delete the S3 folder
		if projectDomain.InternalDomain != "" {
			bucket := config.Configs.UiBuilder.S3Bucket
			prefix := projectDomain.InternalDomain + ".web" + "/"
			err = utils.DeleteS3Folder(bucket, prefix)
			if err != nil {
				logrus.Error(err.Error())
				// we move forward for the next certificates because we don't want to lose them
				errOccurred = true
				continue
			}
		}

		// If external domain starts with 'www' we should add nginx config to redirect from root to www.{root} address
		// if strings.HasPrefix(projectDomain.ExternalDomain, "www") {
		// 	nginxDto := struct {
		// 		Domain string `json:"domain"`
		// 	}{
		// 		Domain: projectDomain.ExternalDomain,
		// 	}
		// 	jsonData, marshalingErr := json.Marshal(nginxDto)
		// 	if marshalingErr != nil {
		// 		logrus.Error(marshalingErr.Error())
		// 		// we move forward for the next certificates because we don't want to lose them
		// 		errOccurred = true
		// 		continue
		// 	}
		// 	requestBody := bytes.NewBuffer(jsonData)
		// 	httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
		// 	url := config.Configs.Endpoints.GoNginx + "/domain"
		// 	out, httpReqErr, statusCode, _ := httpHelper.HttpRequest(http.MethodPost, url, requestBody, nil, time.Minute, true)
		// 	if httpReqErr != nil {
		// 		logrus.Error(httpReqErr.Error())
		// 		// we move forward for the next certificates because we don't want to lose them
		// 		errOccurred = true
		// 		continue
		// 	}
		// 	if statusCode != http.StatusOK && statusCode != http.StatusAccepted {
		// 		logrus.Println(string(out))
		// 		err = errors.New("not ok with status: " + strconv.Itoa(statusCode))
		// 		logrus.Error(err.Error())
		// 		// "error": "Please first add given A record to your DNS's records",
		// 		// we move forward for the next certificates because we don't want to lose them
		// 		errOccurred = true
		// 		continue
		// 	}
		// }
		if errOccurred {
			errCerts = append(errCerts, certArn)
		}

	}
	if len(errCerts) != 0 {
		err = fmt.Errorf("error occurred on these certificates: %s", strings.Join(errCerts, ","))
	}
	return
}

// This function creates a new S3 bucket and a CloudFront distribution in front of it
func createCloudFrontDistribution(domain, certificateArn, projectTag string) (distributionArn, distributionDomainName, bucketName string, err error) {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := s3.New(session.New(), cfg)

	// Create a bucket with a uuid name. Here we switch from the default bucket to a dedicated bucket for this project
	// TODO: Delete the folder for this project in the default bucket
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
	if err != nil {
		logrus.Error(err.Error())
		return
	}

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
