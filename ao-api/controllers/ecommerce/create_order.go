package ecommerce

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/client"
)

type orderDTO struct {
	PaymentId  string `json:"payment_id" binding:"required"`
	PriceId    string `json:"price_id"` // this field can be multiple and separated by ','
	CustomerId string `json:"customer_id" binding:"required"`
	CreatedAt  string `json:"created_at" binding:"required"`
	UnitAmount string `json:"unit_amount"` // this field can be multiple and separated by ','
	ProductId  string `json:"product_id"`  // this field can be multiple and separated by ','
	Quantity   string `json:"quantity"`    // this field can be multiple and separated by ','
}

func (ec *EcommerceController) CreateOrder() gin.HandlerFunc {
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

		dto := orderDTO{}
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
		_, err = sc.Account.Get()
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid stripe secret key",
			})
			return
		}

		stripePayment, err := sc.PaymentIntents.Get(dto.PaymentId, nil)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid stripe payment",
			})
			return
		}
		if time.Unix(stripePayment.Created, 0).UTC().Format(time.RFC3339) != dto.CreatedAt {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid stripe payment time",
			})
			return
		}

		stripeCustomer, err := sc.Customers.Get(dto.CustomerId, nil)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid stripe customer id",
			})
			return
		}

		productIdList := strings.Split(dto.ProductId, ",")
		priceIdList := strings.Split(dto.PriceId, ",")
		unitAmountList := strings.Split(dto.UnitAmount, ",")
		quantityList := strings.Split(dto.Quantity, ",")
		for i := 0; i < len(strings.Split(dto.ProductId, ",")); i++ {
			productId := productIdList[i]
			priceId := priceIdList[i]
			unitAmount, err := strconv.Atoi(unitAmountList[i])
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
				return
			}
			quantity, err := strconv.Atoi(quantityList[i])
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
				return
			}

			findProductIdQuery := fmt.Sprintf(`
			select * from products 
			where stripe_product_id='%s';`, productId)
			findProductIdRes, err := ec.DatabaseService.RunDatabaseQuery(projectTag, findProductIdQuery)
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
				return
			}
			pidRows, ok := findProductIdRes["rows"].([]map[string]interface{})
			if !ok || len(pidRows) != 1 {
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "invalid product",
				})
				return
			}
			tableProductId := pidRows[0]["id"].(int64)

			stripePrice, err := sc.Prices.Get(priceId, nil)
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "invalid stripe price id",
				})
				return
			}
			validUntil := ""
			if stripePrice.Type == stripe.PriceTypeRecurring {
				validUntil = GetStripeSubscriptionEndDate(time.Unix(stripePayment.Created, 0), string(stripePrice.Recurring.Interval), int(stripePrice.Recurring.IntervalCount)).Format(time.RFC3339)
			} else {
				validUntil = time.Unix(stripePayment.Created, 0).UTC().AddDate(100, 0, 0).Format(time.RFC3339)
			}

			/* insert a row to 'user_products' table that be used for bought products by tp users
			'user_products' table columns:
			{
				"__products": 0,
				"email": "",
				"valid_until": ""
			}
			*/
			err = ec.DatabaseService.InsertRow("", projectTag, "user_products", map[string]interface{}{
				"__products":  tableProductId,
				"email":       stripeCustomer.Email,
				"valid_until": validUntil,
			})
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{
					"message": err.Error(),
				})
				return
			}

			/* insert a row to 'orders' table that be used for showing orders to DoTenX user
			'orders' table columns:
			{
				"__products": 0,
				"quantity": 0,
				"address": {},
				"email": "",
				"payment_status": "",
				"updated_at": "",
				"paid_amount": 0.0
			}
			*/
			err = ec.DatabaseService.InsertRow("", projectTag, "orders", map[string]interface{}{
				"__products":     tableProductId,
				"quantity":       quantity,
				"address":        map[string]interface{}{},
				"email":          stripeCustomer.Email,
				"payment_status": stripePayment.Status,
				"updated_at":     time.Unix(stripePayment.Created, 0).UTC().Format(time.RFC3339),
				"paid_amount":    float64(unitAmount*quantity) / 100.0,
			})
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{
					"message": err.Error(),
				})
				return
			}
		}

		stripeInvoiceIter := sc.Invoices.List(&stripe.InvoiceListParams{
			CreatedRange: &stripe.RangeQueryParams{
				GreaterThanOrEqual: stripePayment.Created,
			},
		})
		stripeInvoiceFound := false
		stripeInvoice := stripe.Invoice{}
		for stripeInvoiceIter.Next() {
			current := stripeInvoiceIter.Invoice()
			if current.PaymentIntent.ID == stripePayment.ID {
				stripeInvoice = *current
				stripeInvoiceFound = true
			}
		}
		if !stripeInvoiceFound {
			logrus.Error("stripe invoice not found")
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "stripe invoice not found",
			})
			return
		}

		emailSubject := "Thanks for your choice!"
		emailContent := fmt.Sprintf(`
		<html>
		<head>
			<style>
			body {
				font-family: Impact, sans-serif;
			}
			</style>
		</head>
		<h2>Thanks for your choice!</h2>
		<p>You have recently purchased product(s) please register/login to DoTenX website for downloading your product contents</p>
		<a href="%s">Invoice Link</a>
		<a href="%s">Download Invoice As PDF</a>
		</html>`, stripeInvoice.HostedInvoiceURL, stripeInvoice.InvoicePDF)
		_, err = SendEmailBySendgrid(config.Configs.Secrets.SendGridToken, "noreply@dotenx.com", stripeCustomer.Email, emailSubject, "", emailContent)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}
	}
}

// Thanks Chat-gpt for writing this function
func GetStripeSubscriptionEndDate(startAt time.Time, interval string, intervalCount int) time.Time {
	switch interval {
	case "day":
		return startAt.AddDate(0, 0, intervalCount)
	case "week":
		return startAt.AddDate(0, 0, 7*intervalCount)
	case "month":
		return startAt.AddDate(0, intervalCount, 0)
	case "year":
		return startAt.AddDate(intervalCount, 0, 0)
	default: // if invalid input is given return current date
		return startAt
	}

	return startAt // should never reach here but just in case return current date
}

func SendEmailBySendgrid(apiKey, sender, target, subject, textContent, htmlContent string) (map[string]interface{}, error) {
	if textContent == "" && htmlContent == "" {
		return nil, errors.New("at least one of the text or html content parameters must be provided")
	}
	targets := make([]map[string]string, 0)
	for _, t := range strings.Split(strings.ReplaceAll(target, " ", ""), ",") {
		targets = append(targets, map[string]string{
			"email": t,
			"name":  "DoTenX third-party user",
		})
	}
	// SEE: https://docs.sendgrid.com/api-reference/mail-send/mail-send
	sendMailUrl := "https://api.sendgrid.com/v3/mail/send"
	sendMailBody := make(map[string]interface{})
	personalizations := make([]map[string]interface{}, 0)
	personalizations = append(personalizations, map[string]interface{}{
		"subject": subject,
		"to":      targets,
	})
	sendMailBody["personalizations"] = personalizations
	sendMailBody["from"] = map[string]interface{}{
		"email": sender,
		"name":  "DoTenX",
	}

	if textContent != "" {
		sendMailBody["content"] = []map[string]string{
			{
				"type":  "text/plain",
				"value": textContent,
			},
		}
	}
	if htmlContent != "" {
		sendMailBody["content"] = []map[string]string{
			{
				"type":  "text/html",
				"value": htmlContent,
			},
		}
	}

	sendMailHeaders := []utils.Header{
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", apiKey),
		},
	}
	jsonData, err := json.Marshal(sendMailBody)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	fmt.Println("body of send mail request:", string(jsonData))
	httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
	out, err, statusCode, _ := httpHelper.HttpRequest(http.MethodPost, sendMailUrl, bytes.NewBuffer(jsonData), sendMailHeaders, 0, true)
	if err != nil || statusCode != http.StatusAccepted {
		fmt.Println("SendGrid response (send email request):", string(out))
		if statusCode != http.StatusAccepted {
			err = errors.New(fmt.Sprint("can't get correct response from SendGrid. Status code: ", statusCode))
		}
		return nil, err
	}
	response := make(map[string]interface{})
	json.Unmarshal(out, &response)
	return response, nil
}
