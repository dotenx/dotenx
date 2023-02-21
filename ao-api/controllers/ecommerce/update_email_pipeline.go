package ecommerce

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (ec *EcommerceController) UpdateEmailPipeline() gin.HandlerFunc {
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
		updateEmailPipelineJsonDtoStr := fmt.Sprintf(createEmailPipelineJsonTemplate, dto.Name, dtxAccessToken, projectTag, getEmailListQuery, dto.From, dto.Subject, dto.TextContent, dto.HtmlContent, sendGridIntegrationName, dto.Name, dto.ScheduleExpression, string(dtoJsonStr))
		var updatePipeLineDto AddPipelineDto
		err = json.Unmarshal([]byte(updateEmailPipelineJsonDtoStr), &updatePipeLineDto)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}
		base := models.Pipeline{
			AccountId:   accountId,
			Name:        updatePipeLineDto.Name,
			ProjectName: project.Name,
		}
		pipeline := models.PipelineVersion{
			Manifest: updatePipeLineDto.Manifest,
		}
		err = ec.PipelineService.UpdatePipeline(&base, &pipeline)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}

	}
}
