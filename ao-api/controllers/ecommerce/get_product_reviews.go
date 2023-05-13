package ecommerce

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (ec *EcommerceController) GetProductReviews() gin.HandlerFunc {
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

		rateCountes := []int64{0, 0, 0, 0, 0}
		sumAllCountes := int64(0)
		for i := range rateCountes {
			getRateCntQuery := fmt.Sprintf(`
			select count(*) as cnt from reviews 
			where rate=%d and __products=%s;`, i+1, productId)
			getRateCntRes, err := ec.DatabaseService.RunDatabaseQuery(projectTag, getRateCntQuery)
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
				return
			}
			rateCntRows := getRateCntRes["rows"].([]map[string]interface{})
			rateCnt := rateCntRows[0]["cnt"].(int64)
			rateCountes[i] = rateCnt
			sumAllCountes += rateCnt
		}

		rates := make(map[string]interface{})
		rates["total_reviews"] = sumAllCountes
		for i, cnt := range rateCountes {
			if sumAllCountes == 0 {
				sumAllCountes = 1
			}
			rates[fmt.Sprint(i+1)] = map[string]interface{}{
				"percentage": fmt.Sprintf("%.2f", float64(cnt)/float64(sumAllCountes)*100),
				"number":     cnt,
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"rates": rates,
		})
	}
}
