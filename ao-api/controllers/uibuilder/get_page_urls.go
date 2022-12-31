package uibuilder

import (
	"net/http"
	"time"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (controller *UIbuilderController) GetPageUrls() gin.HandlerFunc {
	return func(c *gin.Context) {

		var accountId string
		if a, ok := c.Get("accountId"); ok {
			accountId = a.(string)
		}

		// projectTag := c.Param("project_tag")
		pageName := c.Param("page_name")
		domain := "dummy-url.com"
		publishUrl := "https://" + domain + "/" + pageName + ".html"
		previewUrl := "https://" + domain + "/" + pageName + "-" + utils.GetMD5Hash(accountId)[:6] + ".html"

		c.JSON(http.StatusOK, gin.H{
			"publish_url": map[string]interface{}{
				"exist":   true,
				"last_at": time.Now().Format(time.RFC3339),
				"url":     publishUrl,
			},
			"preview_url": map[string]interface{}{
				"exist":   true,
				"last_at": time.Now().Format(time.RFC3339),
				"url":     previewUrl,
			},
		})

	}
}
