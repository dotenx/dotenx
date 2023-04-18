package ecommerce

import (
	"fmt"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/stores/databaseStore"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/v74/client"
)

func (ec *EcommerceController) DeleteDiscountCode() gin.HandlerFunc {
	return func(c *gin.Context) {

		projectTag := c.Param("project_tag")
		discountCode := c.Param("discount_code")
		accountId, _ := utils.GetAccountId(c)

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

		getStripeIntegrationQuery := `
		select integration_name from integrations 
		where type='stripe'
		limit 1;`
		stripeIntRes, err := ec.DatabaseService.RunDatabaseQuery(projectTag, getStripeIntegrationQuery)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		intgRows, ok := stripeIntRes["rows"].([]map[string]interface{})
		if !ok || len(intgRows) != 1 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "you should add your stripe integration first",
			})
			return
		}
		stripeIntegrationName := intgRows[0]["integration_name"].(string)
		integration, err := ec.IntegrationService.GetIntegrationByName(accountId, stripeIntegrationName)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}
		if integration.Type != "stripe" {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "invalid integration",
			})
			return
		}

		stripeSecretKey := integration.Secrets["SECRET_KEY"]
		if stripeSecretKey == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid integration secret",
			})
			return
		}
		sc := &client.API{}
		sc.Init(stripeSecretKey, nil)

		var discountCodeId int
		findDiscountCodeIdQuery := fmt.Sprintf(`
			select id, stripe_promotion_code_id from discount_codes 
			where code='%s';`, discountCode)
		findDiscountCodeIdRes, err := ec.DatabaseService.RunDatabaseQuery(projectTag, findDiscountCodeIdQuery)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		didRows, ok := findDiscountCodeIdRes["rows"].([]map[string]interface{})
		if !ok || len(didRows) != 1 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid discount code",
			})
			return
		}
		discountCodeId = didRows[0]["id"].(int)
		stripePromotionCodeId := didRows[0]["stripe_promotion_code_id"].(string)

		stripePromotionCode, err := sc.PromotionCodes.Get(stripePromotionCodeId, nil)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid discount code",
			})
		}
		stripeCouponId := stripePromotionCode.Coupon.ID
		_, err = sc.Coupons.Del(stripeCouponId, nil)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid discount code",
			})
		}

		err = ec.DatabaseService.DeleteRow("", projectTag, "discount_codes", discountCodeId, databaseStore.ConditionGroup{})
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
		}

		c.Status(http.StatusOK)
	}
}
