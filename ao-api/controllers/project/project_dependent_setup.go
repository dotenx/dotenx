package project

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"reflect"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/dotenx/dotenx/ao-api/services/integrationService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/stripe/stripe-go/v72/client"
)

type DependentSetupRequest struct {
	ProjectName        string            `json:"project_name"`
	IntegrationSecrets map[string]string `json:"integration_secrets"`
	IntegrationType    string            `json:"integration_type"`
}

type AddPipelineDto struct {
	Name          string          `json:"name"`
	IsTemplate    bool            `json:"is_template"`
	IsInteraction bool            `json:"is_interaction"`
	ProjectName   string          `json:"project_name"`
	Manifest      models.Manifest `json:"manifest"`
}

func (pc *ProjectController) ProjectDependentSetup(dbService databaseService.DatabaseService, cService crudService.CrudService, iService integrationService.IntegrationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var dto DependentSetupRequest
		accountId, _ := utils.GetAccountId(c)
		if err := c.ShouldBindJSON(&dto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "name of project should contain just small letters, numbers and underscores also project type should be one of 'freestyle', 'landing_page', 'ecommerce', 'ui_portfolio'",
			})
			return
		}

		project, pErr := pc.Service.GetProject(accountId, dto.ProjectName)
		if pErr != nil {
			logrus.Error(pErr)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": pErr.Error(),
			})
			return
		}
		project.AccountId = accountId

		integrationName := fmt.Sprintf("%s-%s", dto.IntegrationType, utils.RandStringRunes(8, utils.FullRunes))
		integrationSecretsCopy := make(map[string]string)
		for k, v := range dto.IntegrationSecrets {
			integrationSecretsCopy[k] = v
		}
		if reflect.DeepEqual(models.AvaliableIntegrations[dto.IntegrationType], models.IntegrationDefinition{}) {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid integration type",
			})
			return
		}
		for _, secret := range models.AvaliableIntegrations[dto.IntegrationType].Secrets {
			delete(integrationSecretsCopy, secret.Key)
		}
		if len(integrationSecretsCopy) != 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid integration secrets",
			})
			return
		}
		// we check validity of integration secrets in this switch case
		switch dto.IntegrationType {
		case "stripe":
			secretKey := dto.IntegrationSecrets["SECRET_KEY"]
			sc := &client.API{}
			sc.Init(secretKey, nil)
			_, err := sc.Account.Get()
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "invalid stripe secret key",
				})
				return
			}
		}
		refreshToken, ok := dto.IntegrationSecrets["REFRESH_TOKEN"]
		hasRefreshToken := ok && refreshToken != ""
		err := iService.AddIntegration(accountId, models.Integration{
			Name:            integrationName,
			AccountId:       accountId,
			Type:            dto.IntegrationType,
			Secrets:         dto.IntegrationSecrets,
			HasRefreshToken: hasRefreshToken,
			Provider:        "",
			TpAccountId:     "",
		})
		if err != nil {
			logrus.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		var setupErr error
		switch project.Type {
		case "ecommerce":
			addIntegrationToTableQuery := fmt.Sprintf(`
			insert into integrations(type, integration_name) values ('%s', '%s');`, dto.IntegrationType, integrationName)
			_, err := dbService.RunDatabaseQuery(project.Tag, addIntegrationToTableQuery)
			if err != nil {
				logrus.Error(err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": err.Error(),
				})
				return
			}
			authCookie, err := c.Cookie("dotenx")
			if err != nil {
				logrus.Error(err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": err.Error(),
				})
				return
			}
			setupErr = EcommerceDependentSetup(authCookie, project, integrationName, dto.IntegrationType, dbService, cService)
		}
		if setupErr != nil {
			logrus.Error(setupErr)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": setupErr.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Project setup completed successfully"})
	}
}

func EcommerceDependentSetup(authCookie string, project models.Project, integrationName, integrationType string, dbService databaseService.DatabaseService, cService crudService.CrudService) (err error) {
	switch integrationType {
	case "stripe":
		dtxAccessToken := ""
		if !config.Configs.App.RunLocally {
			getDtxTokenUrl := config.Configs.Endpoints.Admin + "/auth/access/token"
			requestHeaders := []utils.Header{
				{
					Key:   "Cookie",
					Value: fmt.Sprintf("dotenx=%s", authCookie),
				},
				{
					Key:   "Content-Type",
					Value: "application/json",
				},
			}
			httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
			out, err, status, _ := httpHelper.HttpRequest(http.MethodGet, getDtxTokenUrl, nil, requestHeaders, time.Minute, true)
			if err != nil {
				return err
			}
			getTokenRespMap := make(map[string]interface{})
			jsonErr := json.Unmarshal(out, &getTokenRespMap)
			if status == http.StatusBadRequest && jsonErr == nil && fmt.Sprint(getTokenRespMap["message"]) != "" {
				createDtxTokenUrl := config.Configs.Endpoints.Admin + "/auth/access/token/create"
				out, err, status, _ = httpHelper.HttpRequest(http.MethodPost, createDtxTokenUrl, nil, requestHeaders, time.Minute, true)
				if err != nil {
					return err
				}
				createTokenRespMap := make(map[string]interface{})
				jsonErr := json.Unmarshal(out, &createTokenRespMap)
				if status == http.StatusOK && jsonErr == nil && fmt.Sprint(createTokenRespMap["accessToken"]) != "" {
					dtxAccessToken = fmt.Sprint(createTokenRespMap["accessToken"])
				} else {
					return errors.New("can't get DTX access token")
				}
			} else if status == http.StatusOK && jsonErr == nil && fmt.Sprint(getTokenRespMap["accessToken"]) != "" {
				dtxAccessToken = fmt.Sprint(getTokenRespMap["accessToken"])
			} else {
				return errors.New("can't get DTX access token")
			}
		}

		createStripePaymentAutomationJsonDtoStr := fmt.Sprintf(`
		{
			"name": "stripe-new-payment",
			"manifest": {
			  "tasks": {
				"http-request": {
				  "type": "Http request",
				  "body": {
					"method": {
					  "type": "directValue",
					  "value": "POST"
					},
					"url": {
					  "type": "directValue",
					  "value": "https://api.dotenx.com/public/ecommerce/project/%s/order"
					},
					"headers": {
					  "type": "directValue",
					  "value": {}
					},
					"body": {
					  "type": "json",
					  "value": {
						"payment_id": {
						  "type": "nested",
						  "nestedKey": "new-payment.id"
						},
						"price_id": {
						  "type": "nested",
						  "nestedKey": "new-payment.items.price.id"
						},
						"customer_id": {
						  "type": "nested",
						  "nestedKey": "new-payment.customer_id"
						},
						"created_at": {
						  "type": "nested",
						  "nestedKey": "new-payment.created"
						},
						"unit_amount": {
						  "type": "nested",
						  "nestedKey": "new-payment.items.price.unit_amount"
						},
						"product_id": {
						  "type": "nested",
						  "nestedKey": "new-payment.items.price.product.id"
						},
						"quantity": {
						  "type": "nested",
						  "nestedKey": "new-payment.items.quantity"
						}
					  }
					}
				  },
				  "integration": "",
				  "executeAfter": {}
				}
			  },
			  "triggers": {
				"new-payment": {
				  "name": "new-payment",
				  "type": "Stripe payment completed",
				  "pipeline_name": "default",
				  "integration": "%s",
				  "credentials": {
					"PAYMENT_STATUS": "succeeded",
					"passed_seconds": "3660"
				  }
				}
			  }
			},
			"is_template": false,
			"is_interaction": false
		}
		`, project.Tag, integrationName)
		var dto AddPipelineDto
		err = json.Unmarshal([]byte(createStripePaymentAutomationJsonDtoStr), &dto)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
		_, err = CreateAndActivatePipeline(project, dto, cService)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}

		/*
			Create Stripe payment link inputs:
			{
				"email": "{email_of_third_party_user_who_want_buy_products}",
				"success_url": "{success_url}",
				"cancel_url": "{cancel_url}",
				"bag": {
					"{stripe_price_id_1}": "{quantity_1}",
					"{stripe_price_id_2}": "{quantity_2}",
					...
				}
			}

			example:
			{
				"email": "test_name_04@mail.com",
				"success_url": "https://example.web.dotenx.com/payment/success",
				"cancel_url": "https://example.web.dotenx.com/payment/cancel",
				"bag": {
					"price_abcdefghijklmnopqrstuvwxyz": "1"
				}
			}

		*/
		createStripePaymentLinkJsonDtoStr := fmt.Sprintf(`
		{
			"name": "stripe-payment",
			"manifest": {
			  "tasks": {
				"stripe-payment-flow": {
				  "executeAfter": {},
				  "type": "Custom task",
				  "body": {
					"inputs": {
					  "nestedKey": "interactionRunTime.inputs",
					  "type": "nested"
					},
					"outputs": {
					  "outputs": [],
					  "type": "customOutputs"
					},
					"tasks": {
					  "type": "directValue",
					  "value": {
						"steps": [
						  {
							"params": {
							  "name": "final_result"
							},
							"type": "var_declaration"
						  },
						  {
							"params": {
							  "body": {
								"manifest": {
								  "tasks": {
									"task": {
									  "body": {
										"CUS_EMAIL": "inputs.email",
										"CUS_ID": ""
									  },
									  "integration": "%s",
									  "type": "Stripe find customer"
									}
								  }
								}
							  },
							  "headers": {
								"DTX-auth": "\"%s\""
							  },
							  "method": "POST",
							  "output": "find_result",
							  "url": "https://api.dotenx.com/execution/type/task/step/task"
							},
							"type": "execute_task"
						  },
						  {
							"params": {
							  "branches": [
								{
								  "body": [
									{
									  "params": {
										"body": {
										  "manifest": {
											"tasks": {
											  "task": {
												"body": {
												  "CUS_EMAIL": "inputs.email",
												  "CUS_NAME": "",
												  "CUS_PHONE": ""
												},
												"integration": "%s",
												"type": "Stripe create customer"
											  }
											}
										  }
										},
										"headers": {
										  "DTX-auth": "\"%s\""
										},
										"method": "POST",
										"output": "create_result",
										"url": "https://api.dotenx.com/execution/type/task/step/task"
									  },
									  "type": "execute_task"
									},
									{
									  "params": {
										"body": {
										  "manifest": {
											"tasks": {
											  "task": {
												"body": {
												  "CANCEL_URL": "inputs.cancel_url",
												  "CUS_ID": "create_result.customer_id",
												  "SHOPPING_BAG": "inputs.bag",
												  "SUCCESS_URL": "inputs.success_url"
												},
												"integration": "%s",
												"type": "Stripe create payment link"
											  }
											}
										  }
										},
										"headers": {
										  "DTX-auth": "\"%s\""
										},
										"method": "POST",
										"output": "link_result",
										"url": "https://api.dotenx.com/execution/type/task/step/task"
									  },
									  "type": "execute_task"
									},
									{
									  "params": {
										"name": "final_result",
										"value": "link_result"
									  },
									  "type": "assignment"
									}
								  ],
								  "condition": "find_result === null"
								}
							  ],
							  "elseBranch": [
								{
								  "params": {
									"body": {
									  "manifest": {
										"tasks": {
										  "task": {
											"body": {
											  "CANCEL_URL": "inputs.cancel_url",
											  "CUS_ID": "find_result.customer_id",
											  "SHOPPING_BAG": "inputs.bag",
											  "SUCCESS_URL": "inputs.success_url"
											},
											"integration": "%s",
											"type": "Stripe create payment link"
										  }
										}
									  }
									},
									"headers": {
									  "DTX-auth": "\"%s\""
									},
									"method": "POST",
									"output": "link_result",
									"url": "https://api.dotenx.com/execution/type/task/step/task"
								  },
								  "type": "execute_task"
								},
								{
								  "params": {
									"name": "final_result",
									"value": "link_result"
								  },
								  "type": "assignment"
								}
							  ]
							},
							"type": "if"
						  },
						  {
							"params": {
							  "value": "{ result: final_result }"
							},
							"type": "output"
						  }
						]
					  }
					}
				  },
				  "integration": ""
				}
			  },
			  "triggers": {}
			},
			"is_template": false,
			"is_interaction": true
		}
		`, integrationName, dtxAccessToken, integrationName, dtxAccessToken, integrationName, dtxAccessToken, integrationName, dtxAccessToken)
		dto = AddPipelineDto{}
		err = json.Unmarshal([]byte(createStripePaymentLinkJsonDtoStr), &dto)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
		pipelineId, err := CreateAndActivatePipeline(project, dto, cService)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
		// we should make this interaction public to be accessible by tp users
		err = cService.SetInteractionAccess(pipelineId, true)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}

	case "sendGrid":
		sendEmailBySendGridJsonDtoStr := fmt.Sprintf(`
		{
			"name": "send-email",
			"manifest": {
			  "tasks": {
				"send-email": {
				  "executeAfter": {},
				  "type": "SendGrid send email",
				  "body": {
					"html_content": {
					  "nestedKey": "interactionRunTime.html_content",
					  "type": "nested"
					},
					"sender": {
					  "nestedKey": "interactionRunTime.sender",
					  "type": "nested"
					},
					"subject": {
					  "nestedKey": "interactionRunTime.subject",
					  "type": "nested"
					},
					"target": {
					  "nestedKey": "interactionRunTime.target",
					  "type": "nested"
					},
					"text_content": {
					  "nestedKey": "interactionRunTime.text_content",
					  "type": "nested"
					}
				  },
				  "integration": "%s"
				}
			  },
			  "triggers": {}
			},
			"is_template": false,
			"is_interaction": true
		}
		`, integrationName)
		var dto AddPipelineDto
		err = json.Unmarshal([]byte(sendEmailBySendGridJsonDtoStr), &dto)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
		_, err = CreateAndActivatePipeline(project, dto, cService)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
	}
	return
}

func CreateAndActivatePipeline(project models.Project, dto AddPipelineDto, cService crudService.CrudService) (pipelineId string, err error) {
	base := models.Pipeline{
		AccountId:     project.AccountId,
		Name:          dto.Name,
		ProjectName:   project.Name,
		IsInteraction: dto.IsInteraction,
		IsTemplate:    dto.IsTemplate,
	}
	pipeline := models.PipelineVersion{
		Manifest: dto.Manifest,
	}

	err = cService.CreatePipeLine(&base, &pipeline, dto.IsTemplate, dto.IsInteraction, project.Name)
	if err != nil {
		return "", err
	}
	newP, err := cService.GetPipelineByName(base.AccountId, base.Name, base.ProjectName)
	if err != nil {
		log.Println(err)
		return "", err
	}
	err = cService.ActivatePipeline(base.AccountId, newP.PipelineDetailes.Id)
	if err != nil {
		log.Println(err)
		return "", err
	}
	return newP.PipelineDetailes.Id, nil
}
