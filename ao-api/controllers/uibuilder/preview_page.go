package uibuilder

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/controllers/uibuilder/publishutils"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

/*
 This function renders the page with a preview url and if the request's body is not empty and `WithoutPublish` is true in the request's body
  responds with a json containing the html, scripts and styles without publishing the page.
*/
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

		// if request's body is not empty and `WithoutPublish` is true in the request's body respond with a json containing the html, scripts and styles
		if c.Request.Body != nil {
			var body struct {
				WithoutPublish bool `json:"without_publish"`
			}
			err := c.BindJSON(&body)
			if err != nil {
				logrus.Error(err.Error())
				c.AbortWithStatus(http.StatusInternalServerError)
				return
			}
			if body.WithoutPublish {
				c.JSON(http.StatusOK, gin.H{
					"html":    html,
					"scripts": scripts,
					"styles":  styles,
				})
				return
			}
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
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
