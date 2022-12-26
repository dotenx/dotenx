package uibuilder

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *UIbuilderController) GetPageUrls() gin.HandlerFunc {
	return func(c *gin.Context) {

		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}
		projectTag := c.Param("project_tag")
		pageName := c.Param("page_name")

		// Check that from this project at least one page published or not (exist ProjectDomain)
		projectDomain, err := controller.ProjectService.GetProjectDomain(accountId, projectTag)
		if err != nil {
			if err.Error() == "project_domain not found" { // The project domain is created in this controller. If it doesn't exists, create it.
				logrus.Error(err.Error())
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "project domain not found, you shuold publish your page first",
				})
				return
			} else { // This is an internal server error
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}

		var domain string
		if projectDomain.TlsArn == "" { // We use TLS arn as an indicator that the external domain is verified and ready to be used
			// Ignore the external domain, try to publish with the internal domain
			domain = projectDomain.InternalDomain + ".web.dotenx.com"
		} else {
			// get the status of cdn infra and if it's not ready, first deploy the cdn
			_, err := controller.Service.GetUiInfrastructure(accountId, projectTag)
			if err != nil {
				if err.Error() == "not found" { // The cdn infrastructure is not created, deploy it
					logrus.Error(err.Error())
					c.JSON(http.StatusBadRequest, gin.H{
						"error": "project domain not found, you shuold publish your page first",
					})
					return
				} else { // This is an internal server error
					logrus.Error(err.Error())
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
			}
			domain = projectDomain.ExternalDomain
		}

		publishUrl := "https://" + domain + "/" + pageName + ".html"
		previewUrl := "https://" + domain + "/" + pageName + "-" + utils.GetMD5Hash(accountId)[:6] + ".html"

		c.JSON(http.StatusOK, gin.H{
			"publish_url": publishUrl,
			"preview_url": previewUrl,
		})
	}
}
