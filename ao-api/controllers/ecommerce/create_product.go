package ecommerce

import (
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
	"github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/client"
)

type productDTO struct {
	Type             string                 `json:"type" binding:"required,oneof='one-time' 'membership'"`
	Name             string                 `json:"name" binding:"required"`
	Description      string                 `json:"description"`
	Price            float64                `json:"price" binding:"validpricing"`
	Status           string                 `json:"status" binding:"required,oneof='unpublished' 'published' 'archived'"`
	ImageUrl         string                 `json:"image_url"`
	Limitation       int64                  `json:"limitation" binding:"gte=-1"`
	PreviewLink      string                 `json:"preview_link"`
	DownloadLink     string                 `json:"download_link"`
	Metadata         map[string]interface{} `json:"metadata"`
	StripePriceId    string                 `json:"stripe_price_id"`
	StripeProductId  string                 `json:"stripe_product_id"`
	Content          string                 `json:"content"`
	HtmlContent      string                 `json:"html_content" binding:"html"`
	JsonContent      map[string]interface{} `json:"json_content"`
	Tags             []string               `json:"tags"`
	Currency         string                 `json:"currency" binding:"required"`
	RecurringPayment recurringPayments      `json:"recurring_payment" binding:"validpricing"`
	Versions         productVersions        `json:"versions" binding:"validpricing"`
	Details          map[string]interface{} `json:"details"`
	Summary          string                 `json:"summary"`
	Thumbnails       []string               `json:"thumbnails"`
	FileNames        []string               `json:"file_names"`
}

type recurringPayments struct {
	Prices []recurringPayment `json:"prices"`
}

type recurringPayment struct {
	Price                  float64 `json:"price" binding:"required"`
	RecurringInterval      string  `json:"recurring_interval" binding:"required,oneof='day' 'week' 'month' 'year'"`
	RecurringIntervalCount int64   `json:"recurring_interval_count"`
	IsDefault              bool    `json:"is_default"`
	StripePriceId          string  `json:"stripe_price_id"`
}

type productVersions struct {
	Versions []productVersion `json:"versions"`
}

type productVersion struct {
	Name             string                 `json:"name" binding:"required"`
	Id               int                    `json:"id"`
	Description      string                 `json:"description"`
	Price            float64                `json:"price"`
	Limitation       int64                  `json:"limitation" binding:"gte=-1"`
	Metadata         map[string]interface{} `json:"metadata"`
	StripePriceId    string                 `json:"stripe_price_id"`
	Content          string                 `json:"content"`
	HtmlContent      string                 `json:"html_content" binding:"html"`
	JsonContent      map[string]interface{} `json:"json_content"`
	RecurringPayment recurringPayments      `json:"recurring_payment"`
	FileNames        []string               `json:"file_names"`
}

var validPricing validator.Func = func(fl validator.FieldLevel) bool {
	product, ok := fl.Top().Interface().(productDTO)
	if ok {
		if product.Type == "membership" {
			if len(product.Versions.Versions) != 0 && fl.FieldName() == "Versions" {
				productVersionBytes, ok := fl.Field().Interface().([]byte)
				var productVersion productVersions
				json.Unmarshal(productVersionBytes, &productVersion)
				if !ok {
					return false
				}
				if len(productVersion.Versions) == 0 {
					return false
				}
				for _, v := range product.Versions.Versions {
					for _, price := range v.RecurringPayment.Prices {
						if price.Price < 0 {
							return false
						}
						possibleValues := []string{"day", "week", "month", "year"}
						if !utils.ContainsString(possibleValues, price.RecurringInterval) {
							return false
						}
					}
				}
			} else if len(product.Versions.Versions) == 0 && fl.FieldName() == "RecurringPayment" {
				recurringPaymentBytes, ok := fl.Field().Interface().([]byte)
				var recurringPayment recurringPayments
				json.Unmarshal(recurringPaymentBytes, &recurringPayment)
				if !ok {
					return false
				}
				if len(recurringPayment.Prices) == 0 {
					return false
				}
				for _, price := range recurringPayment.Prices {
					if price.Price < 0 {
						return false
					}
					possibleValues := []string{"day", "week", "month", "year"}
					if !utils.ContainsString(possibleValues, price.RecurringInterval) {
						return false
					}
				}
			}
		} else if product.Type == "one-time" {
			if len(product.Versions.Versions) != 0 && fl.FieldName() == "Versions" {
				for _, v := range product.Versions.Versions {
					if v.Price < 0 {
						return false
					}
				}
			} else if len(product.Versions.Versions) == 0 && fl.FieldName() == "Price" {
				if price, ok := fl.Field().Interface().(float64); !ok || price < 0 {
					return false
				}
			}
		}
	}
	return true
}

// ValidateRecurringPaymentsType implements validator.CustomTypeFunc
var ValidateRecurringPaymentsType validator.CustomTypeFunc = func(field reflect.Value) interface{} {
	if rps, ok := field.Interface().(recurringPayments); ok {
		rpsBytes, _ := json.Marshal(rps)
		return rpsBytes
	}
	return nil
}

func (ec *EcommerceController) CreateProduct() gin.HandlerFunc {
	return func(c *gin.Context) {

		if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
			v.RegisterCustomTypeFunc(ValidateRecurringPaymentsType, recurringPayments{})
			v.RegisterValidation("validpricing", validPricing)
		}

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
		// defaultPriceIndex := 0
		// finding default price for 'membership' products
		if dto.Type == "membership" {
			var versions productVersions
			versions = productVersions{
				Versions: []productVersion{
					{
						RecurringPayment: dto.RecurringPayment,
					},
				},
			}
			if len(dto.Versions.Versions) != 0 {
				versions = dto.Versions
			}
			for _, v := range versions.Versions {
				for _, p := range v.RecurringPayment.Prices {
					if p.IsDefault {
						defaultPriceUnitAmount = int64(p.Price * 100)
						defaultPriceRecurringInterval = p.RecurringInterval
						defaultPriceRecurringIntervalCount = p.RecurringIntervalCount
						// defaultPriceIndex = i
						dto.Price = p.Price
						break
					}
				}
			}
			if defaultPriceRecurringInterval == "" {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "you should select a price as default price",
				})
				return
			}
		}
		// finding default price for 'one-time' products
		if dto.Type == "one-time" {
			if len(dto.Versions.Versions) != 0 {
				defaultPriceUnitAmount = int64(dto.Versions.Versions[0].Price * 100)
				dto.Price = dto.Versions.Versions[0].Price
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

		// creating prices for 'membership' products
		if dto.Type == "membership" {
			var versions productVersions
			versions = productVersions{
				Versions: []productVersion{
					{
						RecurringPayment: dto.RecurringPayment,
					},
				},
			}
			if len(dto.Versions.Versions) != 0 {
				versions = dto.Versions
			}
			for i, v := range versions.Versions {
				priceList := make([]recurringPayment, 0)
				for _, p := range v.RecurringPayment.Prices {
					// if i == defaultPriceIndex {
					// 	p.StripePriceId = stripeProduct.DefaultPrice.ID
					// } else {
					price, err := createPrice(sc, stripeProduct.ID, dto.Currency, int64(p.Price*100), p.RecurringInterval, p.RecurringIntervalCount)
					if err != nil {
						logrus.Error(err.Error())
						c.JSON(http.StatusBadRequest, gin.H{
							"message": err.Error(),
						})
						return
					}
					p.StripePriceId = price.ID
					// }
					priceList = append(priceList, p)
				}
				if len(dto.Versions.Versions) == 0 {
					dto.RecurringPayment.Prices = priceList
				} else {
					v.RecurringPayment.Prices = priceList
					v.Id = i + 1
					dto.Versions.Versions[i] = v
				}
			}
		}
		// creating prices for 'one-time' products
		if dto.Type == "one-time" {
			if len(dto.Versions.Versions) != 0 {
				for i, v := range dto.Versions.Versions {
					price, err := createPrice(sc, stripeProduct.ID, dto.Currency, int64(v.Price*100), "", 0)
					if err != nil {
						logrus.Error(err.Error())
						c.JSON(http.StatusBadRequest, gin.H{
							"message": err.Error(),
						})
						return
					}
					v.StripePriceId = price.ID
					v.Id = i + 1
					dto.Versions.Versions[i] = v
				}
			}
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
