package integrationService

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/v72/client"
)

func (manager *IntegrationManager) GetConnectedAccount(accountId, integrationName string) (map[string]interface{}, error) {

	integration, err := manager.GetIntegrationByName(accountId, integrationName)
	if err != nil {
		return nil, err
	}

	switch integration.Type {
	case "stripe":
		stripeSecretKey := integration.Secrets["SECRET_KEY"]
		if stripeSecretKey == "" {
			err := errors.New("invalid integration secret")
			return nil, err
		}
		sc := &client.API{}
		sc.Init(stripeSecretKey, nil)
		stripeAccount, err := sc.Account.Get()
		if err != nil {
			logrus.Error(err.Error())
			err := errors.New("invalid stripe secret key")
			return nil, err
		}
		return map[string]interface{}{
			"email":   stripeAccount.Email,
			"country": stripeAccount.Country,
			"company": stripeAccount.Company,
		}, nil
	case "sendGrid":
		apiKey := integration.Secrets["ACCESS_TOKEN"]
		host := "https://api.sendgrid.com"
		request := sendgrid.GetRequest(apiKey, "/v3/user/email", host)
		request.Method = "GET"
		response, err := sendgrid.API(request)
		if err != nil || response.StatusCode != http.StatusOK {
			if err == nil {
				err = errors.New("invalid sendGrid api key")
			}
			logrus.Error(err.Error())
			return nil, err
		}
		respBodyMap := make(map[string]interface{})
		json.Unmarshal([]byte(response.Body), &respBodyMap)
		return map[string]interface{}{
			"email": respBodyMap["email"],
		}, nil
	default:
		return nil, errors.New("your integration isn't supported currently")
	}
}
