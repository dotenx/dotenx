package project

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

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
			ExternalDomain  string                   `json:"external_domain"`
			PurchasedFromUs bool                     `json:"purchased_from_us"`
			ContactInfo     models.DomainContactInfo `json:"contact_info" binding:"dive"`
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

		var aiWebsiteConfiguration models.AIWebsiteConfigurationType
		err = json.Unmarshal(project.AIWebsiteConfiguration, &aiWebsiteConfiguration)
		if err != nil {
			logrus.Error(err.Error())
			return
		}
		if dto.PurchasedFromUs {
			if dto.ContactInfo.FirstName == "" || dto.ContactInfo.LastName == "" || dto.ContactInfo.City == "" {
				err = errors.New("these fields are required: first_name, last_name, city")
				c.JSON(http.StatusBadRequest, gin.H{
					"error": err.Error(),
				})
				return
			}
			if aiWebsiteConfiguration.ContactInfo.Address1 == "" || aiWebsiteConfiguration.ContactInfo.Country == "" || aiWebsiteConfiguration.ContactInfo.Email == "" || aiWebsiteConfiguration.ContactInfo.PhoneNumber == "" || aiWebsiteConfiguration.ContactInfo.State == "" {
				err = errors.New("these fields are required: address1, country, email, phone_number, state")
				c.JSON(http.StatusBadRequest, gin.H{
					"error": err.Error(),
				})
				return
			}
			// just for .com.au domains
			if strings.HasSuffix(dto.ExternalDomain, ".com.au") && (dto.ContactInfo.AuIdType == "" || dto.ContactInfo.AuIdNumber == "") {
				err = errors.New("these fields are required for .com.au domains: au_id_type, au_id_number")
				c.JSON(http.StatusBadRequest, gin.H{
					"error": err.Error(),
				})
				return
			}
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

		contactInfo, _ := json.Marshal(dto.ContactInfo)
		projectDomain = models.ProjectDomain{
			AccountId:       accountId,
			ProjectTag:      projectTag,
			TlsArn:          "",
			ExternalDomain:  dto.ExternalDomain,
			InternalDomain:  internalDomain,
			PurchasedFromUs: dto.PurchasedFromUs,
			ContactInfo:     contactInfo,
		}

		if !dto.PurchasedFromUs {
			hostedZoneId, nsRecords, err := utils.CreateHostedZone(dto.ExternalDomain)
			if err != nil {
				logrus.Error(err.Error())
				c.AbortWithStatus(http.StatusInternalServerError)
				return
			}
			projectDomain.HostedZoneId = hostedZoneId
			projectDomain.Nameservers = nsRecords

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

			// add tls validation records to related hosted zone
			err = utils.UpsertRoute53Record(strings.TrimSuffix(validationRecordName, "."), validationRecordValue, projectDomain.HostedZoneId, "CNAME")
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			err = pc.Service.CreateEventBridgeRuleForCertificateIssuance(accountId, projectTag, certificateArn)
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			c.Status(http.StatusOK)
			return
		} else {
			availability, err := pc.Service.CheckDomainAvailability(dto.ExternalDomain)
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if availability != "AVAILABLE" {
				err = utils.ErrDomainNotAvailable
				if availability == "PENDING" {
					err = errors.New("domain availability check is pending, please try again later")
				}
				logrus.Error(err.Error())
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			url, err := pc.Service.GetDomainPaymentLink(accountId, projectTag, dto.ExternalDomain)
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			err = pc.Service.UpsertProjectDomain(projectDomain)
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"payment_link": url,
			})
			return
		}

	}
}
