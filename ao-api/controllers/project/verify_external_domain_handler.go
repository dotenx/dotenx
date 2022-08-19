package project

import (
	"errors"
	"fmt"
	"net"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/acm"
	"github.com/aws/aws-sdk-go/service/route53"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

/*



NOTE: This endpoint has a 10 seconds sleep to make sure the verification records of the certificate are available.
*/

func (pc *ProjectController) VerifyExternalDomain() gin.HandlerFunc {
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
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}

		// External domain is not set, so you cannot verify it
		if projectDomain.ExternalDomain == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "External domain is not set",
			})
			return
		}

		// TLS arn is already set, meaning the domain is verified
		if projectDomain.TlsArn != "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "External domain is already verified",
			})
			return
		}

		isVerified := verifyNameservers(projectDomain.NsRecords, projectDomain.ExternalDomain)
		if !isVerified {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "External domain is not verified",
			})
			return
		}

		// Request the certificate. This operation sets the validation records as well
		certArn, err := requestCertificate(projectDomain.ExternalDomain, projectDomain.HostedZoneId)
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		projectDomain.TlsArn = certArn

		// Now that the TLS certificate is set, we update the project domain with the TLS arn. This can later be used as an indicator that the domain is verified
		err = pc.Service.UpsertProjectDomain(projectDomain)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Status(http.StatusOK)
	}
}

func requestCertificate(domainName, hostedZoneId string) (string, error) {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := acm.New(session.New(), cfg)

	input := &acm.RequestCertificateInput{
		DomainName:       aws.String(domainName),
		IdempotencyToken: aws.String(strings.Replace(domainName, ".", "", -1)),
		ValidationMethod: aws.String("DNS"),
		SubjectAlternativeNames: []*string{
			aws.String("*." + domainName),
		},
		DomainValidationOptions: []*acm.DomainValidationOption{
			{
				DomainName:       aws.String(domainName),
				ValidationDomain: aws.String(domainName),
			},
		},
	}
	result, err := svc.RequestCertificate(input)
	if err != nil {
		return "", err
	}

	time.Sleep(time.Second * 10)

	dcIn := &acm.DescribeCertificateInput{
		CertificateArn: result.CertificateArn,
	}
	c, err := svc.DescribeCertificate(dcIn)
	if err != nil {
		return "", err
	}
	if c.Certificate.DomainValidationOptions == nil {
		errMsg := "DomainValidationOptions dose not exists"
		logrus.Error(errMsg)
		return "", errors.New(errMsg)
	}

	fmt.Println("DomainValidationOptions: ", c.Certificate.DomainValidationOptions)

	if c.Certificate.DomainValidationOptions[0].ResourceRecord == nil {
		errMsg := "ResourceRecord dose not exists"
		logrus.Error(errMsg)
		return "", errors.New(errMsg)
	}

	vRecordName := c.Certificate.DomainValidationOptions[0].ResourceRecord.Name
	vRecordValue := c.Certificate.DomainValidationOptions[0].ResourceRecord.Value
	fmt.Println("vRecordName: ", vRecordName, "vRecordValue: ", vRecordValue)

	err = createRoute53Record(strings.TrimSuffix(*vRecordName, "."), *vRecordValue, hostedZoneId)
	if err != nil {
		return "", err
	}

	return *result.CertificateArn, nil
}

func createRoute53Record(domain, value, hostedZoneId string) error {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := route53.New(session.New(), cfg)
	resourceRecordSet := &route53.ResourceRecordSet{
		Name: aws.String(domain + "."),
		Type: aws.String("CNAME"),
		ResourceRecords: []*route53.ResourceRecord{
			{
				Value: aws.String(value),
			},
		},
		TTL: aws.Int64(300),
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

func verifyNameservers(nsRecords []string, domain string) bool {
	nameserver, err := net.LookupNS(domain)
	if err != nil {
		logrus.Error(err.Error())
		return false
	}
	nsHosts := make([]string, len(nameserver))
	for i := range nameserver {
		nsHosts[i] = strings.TrimSuffix(nameserver[i].Host, ".")
	}
	sort.Strings(nsRecords)
	sort.Strings(nsHosts)
	return compareStringSlices(nsRecords, nsHosts)
}

func compareStringSlices(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}
