package ecommerce

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/v74"
	"github.com/stripe/stripe-go/v74/client"
)

type paymentLinkDto struct {
	Email      string                 `json:"email" binding:"required,email"`
	SuccessUrl string                 `json:"success_url" binding:"required,url"`
	CancelUrl  string                 `json:"cancel_url" binding:"required,url"`
	Bag        map[string]interface{} `json:"bag" binding:"required"`
}

func (ec *EcommerceController) CreateStripePaymentLink() gin.HandlerFunc {
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

		dto := paymentLinkDto{}
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
		integration, err := ec.IntegrationService.GetIntegrationByName(project.AccountId, stripeIntegrationName)
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
		_, err = sc.Accounts.Get()
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid stripe secret key",
			})
			return
		}

		bag := make(map[string]int)
		for priceId, reqQuantity := range dto.Bag {
			bag[priceId], err = strconv.Atoi(fmt.Sprint(reqQuantity))
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "invalid bag in body",
				})
				return
			}
		}

		available, err := checkProductsAvailability(sc, ec.DatabaseService, projectTag, bag)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid bag in body",
			})
			return
		}
		if !available {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "one or more product(s) isn't available in stock",
			})
			return
		}

		var customerId string
		cus, err := findCustomer(sc, "", dto.Email)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid email address",
			})
			return
		}
		if cus == nil {
			customerId, err = createCustomer(sc, "", "", dto.Email)
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "invalid email address",
				})
				return
			}
		} else {
			customerId = cus["customer_id"].(string)
		}

		pLink, err := createPaymentLink(sc, dto.SuccessUrl, dto.CancelUrl, customerId, bag)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "unknown error occurred. invalid bag or success, cancel url",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"payment_link": pLink,
		})
	}
}

func checkProductsAvailability(sc *client.API, dbService databaseService.DatabaseService, projectTag string, bag map[string]int) (bool, error) {
	for priceId, reqQuantity := range bag {
		price, err := sc.Prices.Get(priceId, nil)
		if err != nil {
			logrus.Println(err.Error())
			return false, err
		}
		if !price.Active {
			err = errors.New("one or more price(s) is inactive, the price may has been archived")
			logrus.Println(err.Error())
			return false, err
		}
		findProductQuery := fmt.Sprintf(`
			select * from products 
			where stripe_product_id='%s';`, price.Product.ID)
		findProductRes, err := dbService.RunDatabaseQuery(projectTag, findProductQuery)
		if err != nil {
			logrus.Error(err.Error())
			return false, err
		}
		pRows, ok := findProductRes["rows"].([]map[string]interface{})
		if !ok || len(pRows) != 1 {
			err := errors.New("invalid product")
			logrus.Error(err.Error())
			return false, err
		}
		tableProductMap := pRows[0]
		tableProductBytes, err := json.Marshal(tableProductMap)
		if err != nil {
			logrus.Error(err.Error())
			return false, err
		}
		var tableProduct productDTO
		err = json.Unmarshal(tableProductBytes, &tableProduct)
		if err != nil {
			logrus.Error(err.Error())
			return false, err
		}
		if len(tableProduct.Versions.Versions) == 0 && tableProduct.Limitation == -1 {
			continue
		}
		productLimitation, productVersion := int64(-1), -1
		// finding product version and its limitation
		if len(tableProduct.Versions.Versions) != 0 {
			for _, v := range tableProduct.Versions.Versions {
				if tableProduct.Type == "one-time" {
					if v.StripePriceId == priceId {
						productLimitation = v.Limitation
						productVersion = v.Id
					}
				}
				if tableProduct.Type == "membership" {
					for _, p := range v.RecurringPayment.Prices {
						if p.StripePriceId == priceId {
							productLimitation = v.Limitation
							productVersion = v.Id
							break
						}
					}
				}
				if productVersion != -1 {
					break
				}
			}
			if productVersion == -1 {
				err := errors.New("invalid price id")
				logrus.Error(err.Error())
				return false, err
			}
		} else {
			productLimitation = tableProduct.Limitation
		}
		if productLimitation == -1 {
			continue
		}
		numberOfSoldQuery := fmt.Sprintf(`
		select COALESCE(sum(quantity), 0) as number_of_sold
		from orders join products on orders.__products = products.id
		where products.stripe_product_id = '%s' and orders.version = %d and orders.payment_status = 'succeeded';`, price.Product.ID, productVersion)
		numberOfSoldRes, err := dbService.RunDatabaseQuery(projectTag, numberOfSoldQuery)
		if err != nil {
			logrus.Error(err.Error())
			return false, err
		}
		nosRows, ok := numberOfSoldRes["rows"].([]map[string]interface{})
		if !ok || len(pRows) != 1 {
			err := errors.New("invalid product")
			logrus.Error(err.Error())
			return false, err
		}
		numberOfSold := nosRows[0]["number_of_sold"].(int64)
		if numberOfSold+int64(reqQuantity) > productLimitation {
			return false, nil
		}
	}
	return true, nil
}

func findCustomer(sc *client.API, id, Email string) (map[string]interface{}, error) {
	var cus *stripe.Customer
	var err error
	if Email != "" {
		params := &stripe.CustomerListParams{
			Email: stripe.String(Email),
		}
		customers := sc.Customers.List(params)
		for customers.Next() {
			cus = customers.Customer()
			break
		}
	}
	if id != "" && cus == nil {
		cus, err = sc.Customers.Get(id, nil)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
	}
	if cus == nil {
		return nil, nil
	}
	res := make(map[string]interface{})
	res["customer_id"] = cus.ID
	res["customer_email"] = cus.Email
	return res, nil
}

func createCustomer(sc *client.API, Name, Phone, Email string) (string, error) {
	params := &stripe.CustomerParams{
		Name:  stripe.String(Name),
		Phone: stripe.String(Phone),
		Email: stripe.String(Email),
	}
	c, err := sc.Customers.New(params)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	return c.ID, err
}

func createPaymentLink(sc *client.API, successUrl, cancelUrl, customerId string, shoppingBag map[string]int) (string, error) {
	var isRecurring bool
	bag := make([]*stripe.CheckoutSessionLineItemParams, 0)
	i := 0
	for priceId, quantity := range shoppingBag {
		price, err := sc.Prices.Get(priceId, nil)
		if err != nil {
			fmt.Println(err)
			return "", err
		}
		if i == 0 {
			isRecurring = price.Recurring != nil
		}
		if (isRecurring && price.Recurring == nil) || (!isRecurring && price.Recurring != nil) {
			return "", errors.New("some of prices in your bag are recurring and some of them are on-time")
		}
		bag = append(bag, &stripe.CheckoutSessionLineItemParams{
			Price:    stripe.String(priceId),
			Quantity: stripe.Int64(int64(quantity)),
		})
		i++
	}
	sessionMode := ""
	var params *stripe.CheckoutSessionParams
	if isRecurring {
		sessionMode = string(stripe.CheckoutSessionModeSubscription)
		params = &stripe.CheckoutSessionParams{
			AllowPromotionCodes: stripe.Bool(true),
			SuccessURL:          stripe.String(successUrl),
			CancelURL:           stripe.String(cancelUrl),
			LineItems:           bag,
			Mode:                stripe.String(sessionMode),
			ClientReferenceID:   stripe.String(customerId),
			Customer:            stripe.String(customerId),
		}
	} else {
		sessionMode = string(stripe.CheckoutSessionModePayment)
		params = &stripe.CheckoutSessionParams{
			AllowPromotionCodes: stripe.Bool(true),
			InvoiceCreation: &stripe.CheckoutSessionInvoiceCreationParams{
				Enabled: stripe.Bool(true),
			},
			SuccessURL:        stripe.String(successUrl),
			CancelURL:         stripe.String(cancelUrl),
			LineItems:         bag,
			Mode:              stripe.String(sessionMode),
			ClientReferenceID: stripe.String(customerId),
			Customer:          stripe.String(customerId),
		}
	}
	sess, err := sc.CheckoutSessions.New(params)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	return sess.URL, err
}
