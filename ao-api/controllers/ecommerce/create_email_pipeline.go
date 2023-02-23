package ecommerce

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/winebarrel/cronplan"
)

type emailPipelineDTO struct {
	Name               string                 `json:"name" binding:"required"`
	From               string                 `json:"from" binding:"required"`
	Target             targetPattern          `json:"target"`
	Subject            string                 `json:"subject" binding:"required"`
	TextContent        string                 `json:"text_content"`
	HtmlContent        string                 `json:"html_content"`
	JsonContent        map[string]interface{} `json:"json_content"`
	ScheduleExpression string                 `json:"schedule_expression" binding:"required"`
}

type targetPattern struct {
	ProductIds []int64  `json:"product_ids,omitempty"`
	Tags       []string `json:"tags,omitempty"`
	SendToAll  bool     `json:"send_to_all,omitempty"`
}

type AddPipelineDto struct {
	Name          string          `json:"name"`
	IsTemplate    bool            `json:"is_template"`
	IsInteraction bool            `json:"is_interaction"`
	ProjectName   string          `json:"project_name"`
	Manifest      models.Manifest `json:"manifest"`
}

var createEmailPipelineJsonTemplate string = `
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
			"frequency": "%s",
			"ecommerce_metadata": %s
		  }
		}
	  }
	},
	"is_template": false,
	"is_interaction": false
}
`

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
		if !strings.HasPrefix(dto.ScheduleExpression, "cron") && !strings.HasPrefix(dto.ScheduleExpression, "rate") {
			err = errors.New("schedule_expression should starts with 'cron' or 'rate'")
			logrus.Error(err)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		if strings.HasPrefix(dto.ScheduleExpression, "cron") {
			cronExpression, err := extractValue(dto.ScheduleExpression)
			if err != nil {
				logrus.Error(err)
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
				return
			}
			if !isValidCronExpression(cronExpression) {
				err = errors.New("schedule_expression isn't a valid cron expression")
				logrus.Error(err)
				c.JSON(http.StatusBadRequest, gin.H{
					"message": err.Error(),
				})
				return
			}
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
			dtxAccessToken, err = getDotenxAccessToken(authCookie)
			if err != nil {
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

		getEmailListQuery, err := generateEmailListQuery(dto.Target)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		dtoJsonStr, _ := json.Marshal(dto)
		createEmailPipelineJsonDtoStr := fmt.Sprintf(createEmailPipelineJsonTemplate, dto.Name, dtxAccessToken, projectTag, getEmailListQuery, dto.From, dto.Subject, dto.TextContent, dto.HtmlContent, sendGridIntegrationName, dto.Name, dto.ScheduleExpression, string(dtoJsonStr))
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

func getDotenxAccessToken(authCookie string) (dtxAccessToken string, err error) {
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
		return
	}
	getTokenRespMap := make(map[string]interface{})
	jsonErr := json.Unmarshal(out, &getTokenRespMap)
	if status == http.StatusBadRequest && jsonErr == nil && fmt.Sprint(getTokenRespMap["message"]) != "" {
		createDtxTokenUrl := config.Configs.Endpoints.Admin + "/auth/access/token/create"
		out, err, status, _ = httpHelper.HttpRequest(http.MethodPost, createDtxTokenUrl, nil, requestHeaders, time.Minute, true)
		if err != nil {
			return
		}
		createTokenRespMap := make(map[string]interface{})
		jsonErr := json.Unmarshal(out, &createTokenRespMap)
		if status == http.StatusOK && jsonErr == nil && fmt.Sprint(createTokenRespMap["accessToken"]) != "" {
			dtxAccessToken = fmt.Sprint(createTokenRespMap["accessToken"])
		} else {
			err = errors.New("can't get DTX access token")
			return
		}
	} else if status == http.StatusOK && jsonErr == nil && fmt.Sprint(getTokenRespMap["accessToken"]) != "" {
		dtxAccessToken = fmt.Sprint(getTokenRespMap["accessToken"])
	} else {
		err = errors.New("can't get DTX access token")
		return
	}
	return
}

func generateEmailListQuery(target targetPattern) (getEmailListQuery string, err error) {
	if target.ProductIds != nil && len(target.ProductIds) != 0 {
		idListStr := make([]string, 0)
		for _, pid := range target.ProductIds {
			idListStr = append(idListStr, fmt.Sprint(pid))
		}
		getEmailListQuery = fmt.Sprintf(`
		SELECT DISTINCT email FROM orders
		WHERE __products = ANY(ARRAY[%s]);`, strings.Join(idListStr, ","))
	} else if target.Tags != nil && len(target.Tags) != 0 {
		getEmailListQuery = fmt.Sprintf(`
		SELECT DISTINCT email FROM orders
		JOIN products ON orders.__products = products.id			
		WHERE products.tags && '{%s}';`, strings.Join(target.Tags, ","))
	} else if target.SendToAll {
		getEmailListQuery = "SELECT DISTINCT email FROM orders;"
	} else {
		err = errors.New("invalid target please check request body")
		return
	}
	getEmailListQuery = strings.Replace(getEmailListQuery, "\n", " ", -1)
	getEmailListQuery = strings.Replace(getEmailListQuery, "\t", " ", -1)
	return
}

func extractValue(str string) (string, error) {
	// Define a regular expression pattern to match the value between parentheses
	re := regexp.MustCompile(`\((.*?)\)`)

	// Find the first match of the pattern in the string
	match := re.FindStringSubmatch(str)

	if len(match) < 2 {
		return "", fmt.Errorf("no value found between parentheses in string: %s", str)
	}

	// Return the value between parentheses
	return match[1], nil
}

func isValidCronExpression(expression string) bool {
	_, err := cronplan.Parse(expression)
	if err != nil {
		return false
	}
	return true
}
