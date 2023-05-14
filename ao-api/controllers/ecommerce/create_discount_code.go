package ecommerce

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/v74"
	"github.com/stripe/stripe-go/v74/client"
)

type discountCodeDTO struct {
	Name                  string   `json:"name" binding:"required"`
	Code                  string   `json:"code"`
	Percentage            float64  `json:"percentage"`
	Amount                float64  `json:"amount"`
	Currency              string   `json:"currency"`
	Products              []string `json:"products"`
	Quantity              int64    `json:"quantity"`
	StripePromotionCodeId string   `json:"stripe_promotion_code_id"`
}

func (ec *EcommerceController) CreateDiscountCode() gin.HandlerFunc {
	return func(c *gin.Context) {

		projectTag := c.Param("project_tag")
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

		dto := discountCodeDTO{}
		if err := c.ShouldBindJSON(&dto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
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

		stripeProductIds := make([]string, 0)
		if len(dto.Products) != 0 {
			findProductIdQuery := fmt.Sprintf(`
			select stripe_product_id from products 
			where id=ANY('{%s}'::int[]);`, strings.Join(dto.Products, ","))
			findProductIdRes, err := ec.DatabaseService.RunDatabaseQuery(projectTag, findProductIdQuery)
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
				return
			}
			pidRows, ok := findProductIdRes["rows"].([]map[string]interface{})
			if !ok {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "invalid product",
				})
				return
			}
			for _, row := range pidRows {
				stripeProductIds = append(stripeProductIds, row["stripe_product_id"].(string))
			}
		}

		params := stripe.CouponParams{}
		if len(dto.Products) != 0 {
			params.AppliesTo = &stripe.CouponAppliesToParams{
				Products: stripe.StringSlice(stripeProductIds),
			}
		}
		if dto.Quantity != 0 {
			params.MaxRedemptions = stripe.Int64(dto.Quantity)
		}
		if dto.Percentage != 0 {
			params.PercentOff = stripe.Float64(dto.Percentage)
		} else if dto.Amount != 0 {
			params.AmountOff = stripe.Int64(int64(dto.Amount * 100))
			params.Currency = stripe.String(dto.Currency)
		}
		coupon, err := sc.Coupons.New(&params)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		promotionCodeParams := stripe.PromotionCodeParams{
			Coupon: stripe.String(coupon.ID),
		}
		pCode, err := sc.PromotionCodes.New(&promotionCodeParams)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		dto.Code = pCode.Code
		dto.StripePromotionCodeId = pCode.ID

		dtoBytes, _ := json.Marshal(dto)
		dtoMap := make(map[string]interface{})
		json.Unmarshal(dtoBytes, &dtoMap)
		err = ec.DatabaseService.InsertRow("", projectTag, "discount_codes", dtoMap)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"code": pCode.Code,
		})
	}
}
