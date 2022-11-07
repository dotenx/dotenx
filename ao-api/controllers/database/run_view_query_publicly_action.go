package database

import (
	"net/http"
	"strconv"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (dc *DatabaseController) RunViewQueryPublicly() gin.HandlerFunc {
	return func(c *gin.Context) {
		projectTag := c.Param("project_tag")
		viewName := c.Param("view_name")
		tpAccountId, _ := utils.GetThirdPartyAccountId(c)

		page, err := strconv.Atoi(c.GetHeader("page"))
		if err != nil {
			page = 1
		}

		size, err := strconv.Atoi(c.GetHeader("size"))
		if err != nil {
			size = 10
		}

		isPublic, err := dc.Service.IsViewPublic(projectTag, viewName)
		if err != nil {
			logrus.Error(err.Error())
			if err.Error() == "not found" {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}
		if !isPublic {
			c.JSON(http.StatusForbidden, gin.H{
				"message": "you have not access to this view",
			})
			return
		}

		rows, err := dc.Service.RunViewQuery(tpAccountId, projectTag, viewName, page, size)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, rows)
	}
}
