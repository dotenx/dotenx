package objectstore

import (
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
)

func (controller *ObjectstoreController) SetUserGroups() gin.HandlerFunc {
	return func(c *gin.Context) {
		fileName := c.Param("file_name")
		projectTag := c.Param("project_tag")
		accountId, _ := utils.GetAccountId(c)

		var input struct {
			UserGroups []string `json:"userGroups" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "userGroups is required"})
			return
		}

		err := controller.Service.SetUserGroups(accountId, projectTag, fileName, input.UserGroups)
		if err != nil {
			logrus.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}
	}
}
