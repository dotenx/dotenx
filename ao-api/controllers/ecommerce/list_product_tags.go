package ecommerce

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (ec *EcommerceController) ListProductTags() gin.HandlerFunc {
	return func(c *gin.Context) {

		projectTag := c.Param("project_tag")

		project, err := ec.ProjectService.GetProjectByTag(projectTag)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		if project.Type != "ecommerce" {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "this project isn't an 'ecommerce' project",
			})
			return
		}

		listProductTagsQuery := fmt.Sprintf(`
		SELECT DISTINCT unnest(tags) as tag
		FROM products
		WHERE status='published'
		ORDER BY tag;`)

		result, err := ec.DatabaseService.RunDatabaseQuery(projectTag, listProductTagsQuery)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, result)
	}
}
