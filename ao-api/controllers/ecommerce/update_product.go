package ecommerce

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
	"github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/client"
)

func (ec *EcommerceController) UpdateProduct() gin.HandlerFunc {
	return func(c *gin.Context) {

		if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
			v.RegisterCustomTypeFunc(ValidateRecurringPaymentsType, recurringPayments{})
			v.RegisterValidation("validpricing", validPricing)
		}

		projectTag := c.Param("project_tag")
		productId := c.Param("product_id")
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

		dto := productDTO{}
		if err := c.ShouldBindJSON(&dto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		getOldProductQuery := fmt.Sprintf(`
		select * from products 
		where id=%s;`, productId)
		oldProductRes, err := ec.DatabaseService.RunDatabaseQuery(projectTag, getOldProductQuery)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		oldProductRows, ok := oldProductRes["rows"].([]map[string]interface{})
		if !ok || len(oldProductRows) != 1 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "product id isn't valid",
			})
			return
		}
		oldProductMap := oldProductRows[0]
		oldProductBytes, _ := json.Marshal(oldProductMap)
		oldProduct := productDTO{}
		json.Unmarshal(oldProductBytes, &oldProduct)
		stripeProductId := oldProduct.StripeProductId

		getStripeIntegrationQuery := fmt.Sprintf(`
		select integration_name from integrations 
		where type='stripe'
		limit 1;`)
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

		// find new default price of product
		defaultPriceUnitAmount := int64(dto.Price * 100)
		defaultPriceRecurringInterval := ""
		defaultPriceRecurringIntervalCount := int64(0)
		defaultPriceIndex := 0
		if dto.Type == "membership" {
			for i, p := range dto.RecurringPayment.Prices {
				if p.IsDefault {
					defaultPriceUnitAmount = int64(p.Price * 100)
					defaultPriceRecurringInterval = p.RecurringInterval
					defaultPriceRecurringIntervalCount = p.RecurringIntervalCount
					defaultPriceIndex = i
					dto.Price = p.Price
					break
				}
			}
			if defaultPriceRecurringInterval == "" {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "you should select a price as default price",
				})
				return
			}
		}

		stripeProduct, err := updateProduct(sc, stripeProductId, dto.Name, dto.Currency, defaultPriceUnitAmount, defaultPriceRecurringInterval, defaultPriceRecurringIntervalCount)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		dto.StripePriceId = stripeProduct.DefaultPrice.ID
		dto.StripeProductId = stripeProduct.ID

		// create all new prices
		if dto.Type == "membership" {
			priceList := make([]recurringPayment, 0)
			for i, p := range dto.RecurringPayment.Prices {
				if i == defaultPriceIndex {
					p.StripePriceId = stripeProduct.DefaultPrice.ID
				} else {
					price, err := createPrice(sc, stripeProduct.ID, dto.Currency, int64(p.Price*100), p.RecurringInterval, p.RecurringIntervalCount)
					if err != nil {
						logrus.Error(err.Error())
						c.JSON(http.StatusBadRequest, gin.H{
							"message": err.Error(),
						})
						return
					}
					p.StripePriceId = price.ID
				}
				priceList = append(priceList, p)
			}
			dto.RecurringPayment.Prices = priceList
		}

		// we should deactivate all old prices
		if oldProduct.Type == "membership" {
			for _, p := range oldProduct.RecurringPayment.Prices {
				_, err := deactivatePrice(sc, p.StripePriceId)
				if err != nil {
					logrus.Error(err.Error())
					// currently we ignore errors because stripe doesn't allow archive prices that have active SUBSCRIPTIONS
					// c.JSON(http.StatusInternalServerError, gin.H{
					// 	"message": "there is at least one invalid price in price list",
					// })
					// return
				}
			}
		}

		dtoBytes, _ := json.Marshal(dto)
		dtoMap := make(map[string]interface{})
		json.Unmarshal(dtoBytes, &dtoMap)
		productIdInt, _ := strconv.Atoi(productId)
		err = ec.DatabaseService.UpdateRow("", projectTag, "products", productIdInt, dtoMap)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "product updated successfully",
		})
		return
	}
}

func updateProduct(sc *client.API, productId, name, currency string, unitAmount int64, recurringInterval string, recurringIntervalCount int64) (stripe.Product, error) {
	oldProduct, err := sc.Products.Get(productId, nil)
	if err != nil {
		fmt.Println(err)
		return stripe.Product{}, err
	}

	// first we should create new price
	var priceParams *stripe.PriceParams
	if recurringInterval != "" {
		priceParams = &stripe.PriceParams{
			Product:    stripe.String(productId),
			Currency:   stripe.String(currency),
			UnitAmount: stripe.Int64(unitAmount),
			Recurring: &stripe.PriceRecurringParams{
				Interval:      stripe.String(recurringInterval),
				IntervalCount: stripe.Int64(recurringIntervalCount),
			},
		}
	} else {
		priceParams = &stripe.PriceParams{
			Product:    stripe.String(productId),
			Currency:   stripe.String(currency),
			UnitAmount: stripe.Int64(unitAmount),
		}
	}
	newPrice, err := sc.Prices.New(priceParams)
	if err != nil {
		fmt.Println(err)
		return stripe.Product{}, err
	}

	// then we should update default price id of product
	params := &stripe.ProductParams{
		Name:         stripe.String(name),
		DefaultPrice: stripe.String(newPrice.ID),
	}
	updatedProduct, err := sc.Products.Update(productId, params)
	if err != nil {
		fmt.Println(err)
		return stripe.Product{}, err
	}

	// and finally deactivate old price
	deactivatePriceParams := &stripe.PriceParams{
		Active: stripe.Bool(false),
	}
	_, err = sc.Prices.Update(oldProduct.DefaultPrice.ID, deactivatePriceParams)
	// currently we ignore error because stripe doesn't allow archive prices that have active SUBSCRIPTIONS
	// if err != nil {
	// 	fmt.Println(err)
	// 	return stripe.Product{}, err
	// }
	// return *updatedProduct, err

	return *updatedProduct, nil
}

func deactivatePrice(sc *client.API, priceId string) (stripe.Price, error) {
	deactivatePriceParams := &stripe.PriceParams{
		Active: stripe.Bool(false),
	}
	updatedPrice, err := sc.Prices.Update(priceId, deactivatePriceParams)
	if err != nil {
		fmt.Println(err)
		return stripe.Price{}, err
	}
	return *updatedPrice, err
}
