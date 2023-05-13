package uibuilder

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/controllers/uibuilder/publishutils"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
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
			if err.Error() == "page not found" {
				c.AbortWithError(http.StatusBadRequest, err)
			} else {
				logrus.Error(err.Error())
				c.AbortWithStatus(http.StatusInternalServerError)
			}
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
					TlsArn:         "",
					ExternalDomain: "",
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
			err = utils.UpsertRoute53Record(projectDomain.InternalDomain+".web.dotenx.com", "d2hhdj7tyolioa.cloudfront.net", "Z10095473PHQIPQ1QOCMU", "CNAME") // TODO: Get from config
			if err != nil {
				logrus.Error(err.Error())
				c.Status(http.StatusInternalServerError)
				return
			}

		} else {

			domain = projectDomain.ExternalDomain
			bucket = projectDomain.S3Bucket
			prefix = ""
		}

		utils.UploadByteSliceToS3([]byte(html), bucket, prefix+pageName+".html", int64(len(html)), "text/html")
		utils.UploadByteSliceToS3([]byte(scripts), bucket, prefix+pageName+".js", int64(len(scripts)), "application/javascript")
		utils.UploadByteSliceToS3([]byte(styles), bucket, prefix+pageName+".css", int64(len(styles)), "text/css")

		if err := controller.Service.SetPageStatus(accountId, projectTag, pageName, "published", true, false); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.JSON(http.StatusOK, gin.H{"url": "https://" + domain + "/" + pageName + ".html"})
	}
}
