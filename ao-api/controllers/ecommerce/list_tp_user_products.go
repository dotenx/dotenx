package ecommerce

import (
	"fmt"
	"net/http"
	"time"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (ec *EcommerceController) ListTpUserProducts() gin.HandlerFunc {
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

		tpAccountId, _ := utils.GetThirdPartyAccountId(c)
		user, err := ec.UserManagementService.GetUserInfoById(tpAccountId, projectTag)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}
		listProductsQuery := fmt.Sprintf(`
		select distinct products.id, products.name, products.type, products.summary, products.description, products.price, products.image_url, products.tags, products.currency, products.details, products.thumbnails, user_products.version from user_products 
		join products on user_products.__products=products.id
		where email='%s' and valid_until > '%s';`, user.Email, time.Now().Format(time.RFC3339))

		result, err := ec.DatabaseService.RunDatabaseQuery(projectTag, listProductsQuery)
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
