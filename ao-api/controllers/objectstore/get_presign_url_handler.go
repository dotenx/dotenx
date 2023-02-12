package objectstore

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

/*
	This handler generates a public url for a file based on given expiration time (in seconds)
	and returns it as response. This handler never called by 'tp' user and should be called by
	DoTenX user only
*/

func (controller *ObjectstoreController) GetPresignUrl() gin.HandlerFunc {
	return func(c *gin.Context) {

		fileName := c.Param("file_name")
		projectTag := c.Param("project_tag")
		accountId, _ := utils.GetAccountId(c)

		var dto struct {
			ExpiresIn string `json:"expires_in" binding:"required"` // in seconds
		}
		if err := c.ShouldBindJSON(&dto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "userGroups is required"})
			return
		}

		// Get the presign url and its info
		urlInfo, err := controller.Service.GetPresignUrl(accountId, projectTag, fileName, dto.ExpiresIn)
		if err != nil {
			if err.Error() == "entity not found" {
				c.JSON(http.StatusNotFound, gin.H{
					"message": "file not found",
				})
				return
			}
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, urlInfo)
		return

	}
}
