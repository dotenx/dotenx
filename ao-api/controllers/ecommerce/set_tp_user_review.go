package ecommerce

import (
	"fmt"
	"net/http"
	"time"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type reviewDTO struct {
	Rate int `json:"rate" binding:"required,gte=1,lte=5"`
}

func (ec *EcommerceController) SetTpUserReview() gin.HandlerFunc {
	return func(c *gin.Context) {

		projectTag := c.Param("project_tag")
		productId := c.Param("product_id")

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

		dto := reviewDTO{}
		if err := c.ShouldBindJSON(&dto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
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

		updateReviewQuery := fmt.Sprintf(`
		update reviews 
		set rate=%d 
		where email='%s' and __products=%s;`, dto.Rate, user.Email, productId)
		updateReviewRes, err := ec.DatabaseService.RunDatabaseQuery(projectTag, updateReviewQuery)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		rowsAffected := updateReviewRes["rows_affected"].(int64)
		if rowsAffected == 0 {
			err = ec.DatabaseService.InsertRow(tpAccountId, projectTag, "reviews", map[string]interface{}{
				"__products": productId,
				"email":      user.Email,
				"rate":       dto.Rate,
				"confirmed":  true,
			})
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{
					"message": err.Error(),
				})
				return
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "your review submitted successfully",
		})
	}
}
