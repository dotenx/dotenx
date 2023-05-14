package ecommerce

import (
	"fmt"
	"net/http"
	"time"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (ec *EcommerceController) GetTpUserReview() gin.HandlerFunc {
	return func(c *gin.Context) {

		projectTag := c.Param("project_tag")
		productId := c.Param("product_id")

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
		select __products as id from user_products 
		where email='%s' and valid_until > '%s';`, user.Email, time.Now().Format(time.RFC3339))

		listProductsRes, err := ec.DatabaseService.RunDatabaseQuery(projectTag, listProductsQuery)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		listProductIds, ok := listProductsRes["rows"].([]map[string]interface{})
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "you haven't buy any product",
			})
			return
		}

		boughtThis := false
		for _, pid := range listProductIds {
			if fmt.Sprint(pid["id"]) == productId {
				boughtThis = true
			}
		}
		if !boughtThis {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "you haven't buy this product",
			})
			return
		}

		getReviewQuery := fmt.Sprintf(`
		select * 
		from reviews 
		where email='%s' and __products=%s;`, user.Email, productId)
		getReviewRes, err := ec.DatabaseService.RunDatabaseQuery(projectTag, getReviewQuery)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, getReviewRes)
	}
}
