package project

import (
	"bytes"
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
	"github.com/aws/aws-sdk-go/service/cloudfront"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

func (pc *ProjectController) VerifyCertificate() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)
		projectTag := c.Param("project_tag")

		projectDomain, err := pc.Service.GetProjectDomain(accountId, projectTag)
		if err != nil {
			if err.Error() == "project_domain not found" {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Invalid operation",
				})
				return
			} else { // This is an internal server error
				logrus.Error(err.Error())
				c.Status(http.StatusInternalServerError)
				return
			}
		}

		// External domain is not set, so you cannot verify it
		if projectDomain.TlsArn == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "External domain is not set",
			})
			return
		}

		// Validate the certificate
		isIssued, err := utils.ValidateCertificate(projectDomain.TlsArn)
		if err != nil {
			logrus.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}

		if !isIssued {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Certificate is not issued yet",
			})
			return
		}

		// Create the CloudFront distribution
		distributionArn, distributionDomainName, bucketName, err := createCloudFrontDistribution(projectDomain.ExternalDomain, projectDomain.TlsArn, projectTag)
		if err != nil {
			logrus.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}

		projectDomain.CdnArn = distributionArn
		projectDomain.CdnDomain = distributionDomainName
		projectDomain.S3Bucket = bucketName

		err = pc.Service.UpsertProjectDomain(projectDomain)
		if err != nil {
			logrus.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}

		// Update the CNAME record to now point to the CloudFront distribution we just created
		err = utils.UpsertRoute53Record(projectDomain.InternalDomain+"."+config.Configs.UiBuilder.ParentAddress, distributionDomainName, config.Configs.UiBuilder.HostedZoneId, "CNAME") // TODO: Get from config
		if err != nil {
			logrus.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}

		// If the project is published with dotenx domain, delete the S3 folder
		if projectDomain.InternalDomain != "" {
			bucket := config.Configs.UiBuilder.S3Bucket
			prefix := projectDomain.InternalDomain + ".web" + "/"
			err = utils.DeleteS3Folder(bucket, prefix)
			if err != nil {
				logrus.Error(err.Error())
				c.Status(http.StatusInternalServerError)
				return
			}
		}

		// If external domain starts with 'www' we should add nginx config to redirect from root to www.{root} address
		if strings.HasPrefix(projectDomain.ExternalDomain, "www") {
			nginxDto := struct {
				Domain string `json:"domain"`
			}{
				Domain: projectDomain.ExternalDomain,
			}
			jsonData, err := json.Marshal(nginxDto)
			if err != nil {
				logrus.Error(err.Error())
				c.Status(http.StatusInternalServerError)
				return
			}
			requestBody := bytes.NewBuffer(jsonData)
			httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
			url := config.Configs.Endpoints.GoNginx + "/domain"
			out, err, statusCode, _ := httpHelper.HttpRequest(http.MethodPost, url, requestBody, nil, time.Minute, true)
			if err != nil {
				logrus.Error(err.Error())
				c.Status(http.StatusInternalServerError)
				return
			}
			if statusCode != http.StatusOK && statusCode != http.StatusAccepted {
				logrus.Println(string(out))
				err = errors.New("not ok with status: " + strconv.Itoa(statusCode))
				logrus.Error(err.Error())
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Please first add given A record to your DNS's records",
				})
				return
			}
		}

		c.Status(http.StatusOK)
	}
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
