package uibuilder

import (
	"fmt"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/controllers/uibuilder/publishutils"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *UIbuilderController) PreviewPage() gin.HandlerFunc {
	return func(c *gin.Context) {

		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}

		projectTag := c.Param("project_tag")
		pageName := c.Param("page_name")

		page, err := controller.Service.GetPage(accountId, projectTag, pageName)
		if err != nil {
			if err.Error() == "page not found" {
				c.AbortWithError(http.StatusBadRequest, err)
			} else {
				logrus.Error(err.Error())
				c.AbortWithStatus(http.StatusInternalServerError)
			}
			return
		}
		pageNameWithoutSuffix := page.Name
		page.Name = page.Name + "-" + utils.GetMD5Hash(accountId)[:6]
		pageName = page.Name

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
					logrus.Error(err.Error())
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

		// TODO: currently status of page should be one of these values: ['published', 'modified']
		// (note: this condition checks by postgres because this condition defined in creating table statement)
		// we should use a better status for pages in future
		if err := controller.Service.SetPageStatus(accountId, projectTag, pageNameWithoutSuffix, "modified", false, true); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.JSON(http.StatusOK, gin.H{"url": "https://" + domain + "/" + pageName + ".html"})
	}
}
