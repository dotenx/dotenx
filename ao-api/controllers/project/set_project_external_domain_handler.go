package project

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (pc *ProjectController) SetProjectExternalDomain() gin.HandlerFunc {
	return func(c *gin.Context) {
		accountId, _ := utils.GetAccountId(c)
		projectTag := c.Param("project_tag")
		dto := struct {
			ExternalDomain string `json:"externalDomain"`
		}{}
		if err := c.ShouldBindJSON(&dto); err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}

		project, err := pc.Service.GetProjectByTag(projectTag)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		projectDomain, err := pc.Service.GetProjectDomain(accountId, projectTag)

		if err != nil && err.Error() != "project_domain not found" {
			logrus.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}

		if projectDomain.ExternalDomain == dto.ExternalDomain {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "The domain is already set",
			})
			return
		}

		// The project domain is created in this controller too. If it doesn't exists, create it.

		hasAccess, err := pc.Service.CheckCreateDomainAccess(accountId, project.Type)
		if err != nil {
			logrus.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}
		if !hasAccess {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": utils.ErrReachLimitationOfPlan.Error(),
			})
			return
		}

		internalDomain := projectDomain.InternalDomain
		if internalDomain == "" {
			//This happens when the project domain is being set before even publishing the UI for once.
			internalDomain = GetRandomName(10)
		}

		projectDomain = models.ProjectDomain{
			AccountId:      accountId,
			ProjectTag:     projectTag,
			TlsArn:         "",
			ExternalDomain: dto.ExternalDomain,
			InternalDomain: internalDomain,
		}
		certificateArn, validationRecordName, validationRecordValue, err := utils.RequestSubdomainCertificate(projectDomain.ExternalDomain)

		if err != nil {
			logrus.Error(err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		projectDomain.TlsArn = certificateArn
		projectDomain.TlsValidationRecordName = validationRecordName
		projectDomain.TlsValidationRecordValue = validationRecordValue

		err = pc.Service.UpsertProjectDomain(projectDomain)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// if external domain starts with www we should add nginx config to redirect from root to www.{root} address
		if strings.HasPrefix(dto.ExternalDomain, "www") {
			nginxDto := struct {
				Domain string `json:"domain"`
			}{
				Domain: dto.ExternalDomain,
			}
			jsonData, err := json.Marshal(nginxDto)
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			requestBody := bytes.NewBuffer(jsonData)
			httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
			url := config.Configs.Endpoints.GoNginx + "/domain"
			out, err, statusCode, _ := httpHelper.HttpRequest(http.MethodPost, url, requestBody, nil, time.Minute, true)
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if statusCode != http.StatusOK && statusCode != http.StatusAccepted {
				logrus.Println(string(out))
				err = errors.New("not ok with status: " + strconv.Itoa(statusCode))
				logrus.Error(err.Error())
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "please first add given A record to your dns records",
				})
				return
			}
		}

		c.Status(http.StatusOK)
	}
}
