package project

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/databaseService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type DependentSetupRequest struct {
	ProjectName     string `json:"project_name"`
	IntegrationName string `json:"integration_name"`
	IntegrationType string `json:"integration_type"`
}

type AddPipelineDto struct {
	Name          string          `json:"name"`
	IsTemplate    bool            `json:"is_template"`
	IsInteraction bool            `json:"is_interaction"`
	ProjectName   string          `json:"project_name"`
	Manifest      models.Manifest `json:"manifest"`
}

func (pc *ProjectController) ProjectDependentSetup(dbService databaseService.DatabaseService, cService crudService.CrudService) gin.HandlerFunc {
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

		var err error
		switch project.Type {
		case "ecommerce":
			err = EcommerceDependentSetup(project, dto.IntegrationName, dto.IntegrationType, dbService, cService)
		}
		if err != nil {
			logrus.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Project setup completed successfully"})
	}
}

func EcommerceDependentSetup(project models.Project, integrationName, integrationType string, dbService databaseService.DatabaseService, cService crudService.CrudService) (err error) {
	switch integrationType {
	case "stripe":
		createStripeProductJsonDtoStr := fmt.Sprintf(`
		{
			"name": "create-product",
			"manifest": {
			  "tasks": {
				"create-product": {
				  "executeAfter": {},
				  "type": "Stripe create product",
				  "body": {
					"currency": {
					  "nestedKey": "interactionRunTime.currency",
					  "type": "nested"
					},
					"name": {
					  "nestedKey": "interactionRunTime.name",
					  "type": "nested"
					},
					"recurring_interval": {
					  "nestedKey": "interactionRunTime.recurring_interval",
					  "type": "nested"
					},
					"recurring_interval_count": {
					  "nestedKey": "interactionRunTime.recurring_interval_count",
					  "type": "nested"
					},
					"unit_amount": {
					  "nestedKey": "interactionRunTime.unit_amount",
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
		err = json.Unmarshal([]byte(createStripeProductJsonDtoStr), &dto)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
		err = CreateAndActivatePipeline(project, dto, cService)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}

		createStripePriceJsonDtoStr := fmt.Sprintf(`
		{
			"name": "create-price",
			"manifest": {
			  "tasks": {
				"create-price": {
				  "executeAfter": {},
				  "type": "Stripe create price",
				  "body": {
					"currency": {
					  "nestedKey": "interactionRunTime.currency",
					  "type": "nested"
					},
					"product_id": {
					  "nestedKey": "interactionRunTime.product_id",
					  "type": "nested"
					},
					"recurring_interval": {
					  "nestedKey": "interactionRunTime.recurring_interval",
					  "type": "nested"
					},
					"recurring_interval_count": {
					  "nestedKey": "interactionRunTime.recurring_interval_count",
					  "type": "nested"
					},
					"unit_amount": {
					  "nestedKey": "interactionRunTime.unit_amount",
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
		dto = AddPipelineDto{}
		err = json.Unmarshal([]byte(createStripePriceJsonDtoStr), &dto)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
		err = CreateAndActivatePipeline(project, dto, cService)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}

		updateStripeProductJsonDtoStr := fmt.Sprintf(`
		{
			"name": "update-product",
			"manifest": {
			  "tasks": {
				"update-product": {
				  "executeAfter": {},
				  "type": "Stripe update product",
				  "body": {
					"currency": {
					  "nestedKey": "interactionRunTime.currency",
					  "type": "nested"
					},
					"name": {
					  "nestedKey": "interactionRunTime.name",
					  "type": "nested"
					},
					"product_id": {
					  "nestedKey": "interactionRunTime.product_id",
					  "type": "nested"
					},
					"recurring_interval": {
					  "nestedKey": "interactionRunTime.recurring_interval",
					  "type": "nested"
					},
					"recurring_interval_count": {
					  "nestedKey": "interactionRunTime.recurring_interval_count",
					  "type": "nested"
					},
					"unit_amount": {
					  "nestedKey": "interactionRunTime.unit_amount",
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
		dto = AddPipelineDto{}
		err = json.Unmarshal([]byte(updateStripeProductJsonDtoStr), &dto)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
		err = CreateAndActivatePipeline(project, dto, cService)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}

		/*
			Create Stripe payment link inputs:
			{
				"access_token": "{dotenx_user_access_token_that_starts_with_dtx}",
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
				"access_token": "dtx_abcdefghijklmnopqrstuvwxyz",
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
								"DTX-auth": "inputs.access_token"
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
										  "DTX-auth": "inputs.access_token"
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
										  "DTX-auth": "inputs.access_token"
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
									  "DTX-auth": "inputs.access_token"
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
		`, integrationName, integrationName, integrationName, integrationName)
		dto = AddPipelineDto{}
		err = json.Unmarshal([]byte(createStripePaymentLinkJsonDtoStr), &dto)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
		err = CreateAndActivatePipeline(project, dto, cService)
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
		err = CreateAndActivatePipeline(project, dto, cService)
		if err != nil {
			logrus.Error(err.Error())
			return err
		}
	}
	return
}

func CreateAndActivatePipeline(project models.Project, dto AddPipelineDto, cService crudService.CrudService) (err error) {
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
		return err
	}
	newP, err := cService.GetPipelineByName(base.AccountId, base.Name, base.ProjectName)
	if err != nil {
		log.Println(err)
		return err
	}
	err = cService.ActivatePipeline(base.AccountId, newP.PipelineDetailes.Id)
	if err != nil {
		log.Println(err)
		return err
	}
	return
}
