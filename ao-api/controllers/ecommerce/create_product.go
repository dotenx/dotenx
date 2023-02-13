package ecommerce

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/client"
)

type productDTO struct {
	Type             string                 `json:"type"`
	Name             string                 `json:"name"`
	Description      string                 `json:"description"`
	Price            float64                `json:"price"`
	Status           string                 `json:"status"`
	ImageUrl         string                 `json:"image_url"`
	Limitation       int64                  `json:"limitation"`
	PreviewLink      string                 `json:"preview_link"`
	DownloadLink     string                 `json:"download_link"`
	Metadata         map[string]interface{} `json:"metadata"`
	StripePriceId    string                 `json:"stripe_price_id"`
	StripeProductId  string                 `json:"stripe_product_id"`
	Content          string                 `json:"content"`
	Tags             []string               `json:"tags"`
	Currency         string                 `json:"currency"`
	RecurringPayment recurringPayments      `json:"recurring_payment"`
	Details          map[string]interface{} `json:"details"`
	Summary          string                 `json:"summary"`
	Thumbnails       []string               `json:"thumbnails"`
	FileNames        []string               `json:"file_names"`
}

type recurringPayments struct {
	Prices []recurringPayment `json:"prices"`
}

type recurringPayment struct {
	Price                  float64 `json:"price"`
	RecurringInterval      string  `json:"recurring_interval"`
	RecurringIntervalCount int64   `json:"recurring_interval_count"`
	IsDefault              bool    `json:"is_default"`
	StripePriceId          string  `json:"stripe_price_id"`
}

func (ec *EcommerceController) CreateProduct() gin.HandlerFunc {
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

		dto := productDTO{}
		if err := c.ShouldBindJSON(&dto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

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
		stripeProduct, err := createProduct(sc, dto.Name, dto.Currency, defaultPriceUnitAmount, defaultPriceRecurringInterval, defaultPriceRecurringIntervalCount)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		dto.StripePriceId = stripeProduct.DefaultPrice.ID
		dto.StripeProductId = stripeProduct.ID

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

		dtoBytes, _ := json.Marshal(dto)
		dtoMap := make(map[string]interface{})
		json.Unmarshal(dtoBytes, &dtoMap)
		err = ec.DatabaseService.InsertRow("", projectTag, "products", dtoMap)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "product created successfully",
		})
		return
	}
}

func createProduct(sc *client.API, name, currency string, unitAmount int64, recurringInterval string, recurringIntervalCount int64) (stripe.Product, error) {
	var params *stripe.ProductParams
	if recurringInterval != "" {
		params = &stripe.ProductParams{
			Name: stripe.String(name),
			DefaultPriceData: &stripe.ProductDefaultPriceDataParams{
				Currency:   stripe.String(currency),
				UnitAmount: stripe.Int64(unitAmount),
				Recurring: &stripe.ProductDefaultPriceDataRecurringParams{
					Interval:      stripe.String(recurringInterval),
					IntervalCount: stripe.Int64(recurringIntervalCount),
				},
			},
		}
	} else {
		params = &stripe.ProductParams{
			Name: stripe.String(name),
			DefaultPriceData: &stripe.ProductDefaultPriceDataParams{
				Currency:   stripe.String(currency),
				UnitAmount: stripe.Int64(unitAmount),
			},
		}
	}
	c, err := sc.Products.New(params)
	if err != nil {
		fmt.Println(err)
		return stripe.Product{}, err
	}
	return *c, err
}

func createPrice(sc *client.API, productId, currency string, unitAmount int64, recurringInterval string, recurringIntervalCount int64) (stripe.Price, error) {
	var params *stripe.PriceParams
	if recurringInterval != "" {
		params = &stripe.PriceParams{
			Product:    stripe.String(productId),
			UnitAmount: stripe.Int64(unitAmount),
			Currency:   stripe.String(currency),
			Recurring: &stripe.PriceRecurringParams{
				Interval:      stripe.String(recurringInterval),
				IntervalCount: stripe.Int64(recurringIntervalCount),
			},
		}
	} else {
		params = &stripe.PriceParams{
			Product:    stripe.String(productId),
			UnitAmount: stripe.Int64(unitAmount),
			Currency:   stripe.String(currency),
		}
	}
	p, err := sc.Prices.New(params)
	if err != nil {
		fmt.Println(err)
		return stripe.Price{}, err
	}
	return *p, err
}
