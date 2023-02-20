package ecommerce

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type emailPipelineDTO struct {
	Name               string        `json:"name"`
	From               string        `json:"from"`
	Target             targetPattern `json:"target"`
	Subject            string        `json:"subject"`
	TextContent        string        `json:"text_content"`
	HtmlContent        string        `json:"html_content"`
	ScheduleExpression string        `json:"schedule_expression"`
}

type targetPattern struct {
	ProductIds []int64  `json:"product_ids"`
	Tags       []string `json:"tags"`
	SendToAll  bool     `json:"send_to_all"`
}

type AddPipelineDto struct {
	Name          string          `json:"name"`
	IsTemplate    bool            `json:"is_template"`
	IsInteraction bool            `json:"is_interaction"`
	ProjectName   string          `json:"project_name"`
	Manifest      models.Manifest `json:"manifest"`
}

func (ec *EcommerceController) CreateEmailPipeline() gin.HandlerFunc {
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

		dto := emailPipelineDTO{}
		if err := c.ShouldBindJSON(&dto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		if utils.ContainsString(DefaultPipelineNames, dto.Name) {
			err = errors.New("you can't choose this pipeline name, please change it")
			logrus.Error(err)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		if dto.HtmlContent == "" && dto.TextContent == "" {
			err = errors.New("at least one of the text or HTML contents must be provided")
			logrus.Error(err)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
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
				logrus.Error(err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": err.Error(),
				})
				return
			}
			getTokenRespMap := make(map[string]interface{})
			jsonErr := json.Unmarshal(out, &getTokenRespMap)
			if status == http.StatusBadRequest && jsonErr == nil && fmt.Sprint(getTokenRespMap["message"]) != "" {
				createDtxTokenUrl := config.Configs.Endpoints.Admin + "/auth/access/token/create"
				out, err, status, _ = httpHelper.HttpRequest(http.MethodPost, createDtxTokenUrl, nil, requestHeaders, time.Minute, true)
				if err != nil {
					logrus.Error(err)
					c.JSON(http.StatusInternalServerError, gin.H{
						"error": err.Error(),
					})
					return
				}
				createTokenRespMap := make(map[string]interface{})
				jsonErr := json.Unmarshal(out, &createTokenRespMap)
				if status == http.StatusOK && jsonErr == nil && fmt.Sprint(createTokenRespMap["accessToken"]) != "" {
					dtxAccessToken = fmt.Sprint(createTokenRespMap["accessToken"])
				} else {
					err = errors.New("can't get DTX access token")
					logrus.Error(err)
					c.JSON(http.StatusInternalServerError, gin.H{
						"error": err.Error(),
					})
					return
				}
			} else if status == http.StatusOK && jsonErr == nil && fmt.Sprint(getTokenRespMap["accessToken"]) != "" {
				dtxAccessToken = fmt.Sprint(getTokenRespMap["accessToken"])
			} else {
				err = errors.New("can't get DTX access token")
				logrus.Error(err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": err.Error(),
				})
				return
			}
		}

		getSendGridIntegrationQuery := fmt.Sprintf(`
		select integration_name from integrations 
		where type='sendGrid'
		limit 1;`)
		sendGridIntRes, err := ec.DatabaseService.RunDatabaseQuery(projectTag, getSendGridIntegrationQuery)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		intgRows, ok := sendGridIntRes["rows"].([]map[string]interface{})
		if !ok || len(intgRows) != 1 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "you should add your sendGrid integration first",
			})
			return
		}
		sendGridIntegrationName := intgRows[0]["integration_name"].(string)
		integration, err := ec.IntegrationService.GetIntegrationByName(accountId, sendGridIntegrationName)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}
		if integration.Type != "sendGrid" {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "invalid integration",
			})
			return
		}

		getEmailListQuery := ""
		if dto.Target.ProductIds != nil && len(dto.Target.ProductIds) != 0 {
			idListStr := make([]string, 0)
			for _, pid := range dto.Target.ProductIds {
				idListStr = append(idListStr, fmt.Sprint(pid))
			}
			getEmailListQuery = fmt.Sprintf(`
			SELECT DISTINCT email FROM orders
			WHERE __products = ANY(ARRAY[%s]);`, strings.Join(idListStr, ","))
		} else if dto.Target.Tags != nil && len(dto.Target.Tags) != 0 {
			getEmailListQuery = fmt.Sprintf(`
			SELECT DISTINCT email FROM orders
			JOIN products ON orders.__products = products.id			
			WHERE products.tags && '{%s}';`, strings.Join(dto.Target.Tags, ","))
		} else if dto.Target.SendToAll {
			getEmailListQuery = "SELECT DISTINCT email FROM orders;"
		} else {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid target please check request body",
			})
			return
		}
		getEmailListQuery = strings.Replace(getEmailListQuery, "\n", " ", -1)
		getEmailListQuery = strings.Replace(getEmailListQuery, "\t", " ", -1)

		createEmailPipelineJsonDtoStr := fmt.Sprintf(`
		{
			"name": "%s",
			"manifest": {
			  "tasks": {
				"run-query": {
				  "type": "Run custom query",
				  "body": {
					"dtx_access_token": {
					  "type": "directValue",
					  "value": "%s"
					},
					"project_tag": {
					  "type": "directValue",
					  "value": "%s"
					},
					"query": {
					  "type": "directValue",
					  "value": "%s"
					}
				  },
				  "integration": "",
				  "executeAfter": {}
				},
				"send-email": {
				  "type": "SendGrid send email",
				  "body": {
					"sender": {
					  "type": "directValue",
					  "value": "%s"
					},
					"target": {
					  "type": "nested",
					  "nestedKey": "run-query.rows.email"
					},
					"subject": {
					  "type": "directValue",
					  "value": "%s"
					},
					"text_content": {
					  "type": "directValue",
					  "value": "%s"
					},
					"html_content": {
					  "type": "directValue",
					  "value": "%s"
					}
				  },
				  "integration": "%s",
				  "executeAfter": {
					"run-query": [
					  "completed"
					]
				  }
				}
			  },
			  "triggers": {
				"scheduler": {
				  "name": "scheduler",
				  "type": "Schedule",
				  "pipeline_name": "%s",
				  "credentials": {
					"frequency": "%s"
				  }
				}
			  }
			},
			"is_template": false,
			"is_interaction": false
		}
		`, dto.Name, dtxAccessToken, projectTag, getEmailListQuery, dto.From, dto.Subject, dto.TextContent, dto.HtmlContent, sendGridIntegrationName, dto.Name, dto.ScheduleExpression)
		var createPipeLineDto AddPipelineDto
		err = json.Unmarshal([]byte(createEmailPipelineJsonDtoStr), &createPipeLineDto)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}
		_, err = CreatePipeline(project, createPipeLineDto, ec.PipelineService)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}

	}
}

func CreatePipeline(project models.Project, dto AddPipelineDto, cService crudService.CrudService) (pipelineId string, err error) {
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
	// err = cService.ActivatePipeline(base.AccountId, newP.PipelineDetailes.Id)
	// if err != nil {
	// 	log.Println(err)
	// 	return "", err
	// }
	return newP.PipelineDetailes.Id, nil
}
