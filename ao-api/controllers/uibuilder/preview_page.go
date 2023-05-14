package uibuilder

import (
	"net/http"
	"os"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/controllers/uibuilder/publishutils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

/*
	this handler is equal with PublishPage handler
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
		html, scripts, styles, err := publishutils.RenderPage(page)
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		htmlFile, err := os.Create(config.Configs.App.UiBuilderPublishPath + pageName + ".html")
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
		}
		defer htmlFile.Close()
		_, err = htmlFile.Write([]byte(html))
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
		}

		scriptsFile, err := os.Create(config.Configs.App.UiBuilderPublishPath + pageName + ".js")
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
		}
		defer scriptsFile.Close()
		_, err = scriptsFile.Write([]byte(scripts))
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
		}

		stylesFile, err := os.Create(config.Configs.App.UiBuilderPublishPath + pageName + ".css")
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
		}
		defer stylesFile.Close()
		_, err = stylesFile.Write([]byte(styles))
		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
		}

		if err := controller.Service.SetPageStatus(accountId, projectTag, pageName, "published", true, false); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"path": config.Configs.App.UiBuilderPublishPath + pageName + ".html",
		})
	}
}
