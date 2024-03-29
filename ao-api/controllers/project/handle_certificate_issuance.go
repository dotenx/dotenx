package project

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type awsEventDto struct {
	Message          string `json:"Message"`
	MessageID        string `json:"MessageId"`
	Signature        string `json:"Signature"`
	SignatureVersion string `json:"SignatureVersion"`
	SigningCertURL   string `json:"SigningCertURL"`
	Timestamp        string `json:"Timestamp"`
	TopicArn         string `json:"TopicArn"`
	Type             string `json:"Type"`
	UnsubscribeURL   string `json:"UnsubscribeURL"`
}

type awsEventMessage struct {
	Version    string         `json:"version"`
	Id         string         `json:"id"`
	DetailType string         `json:"detail-type"`
	Source     string         `json:"source"`
	Account    string         `json:"account"`
	Time       time.Time      `json:"time"`
	Region     string         `json:"region"`
	Resources  []string       `json:"resources"`
	Detail     acmEventDetail `json:"detail"`
}

type acmEventDetail struct {
	Action                    string    `json:"Action"`
	CertificateType           string    `json:"CertificateType"`
	CommonName                string    `json:"CommonName"`
	DomainValidationMethod    string    `json:"DomainValidationMethod"`
	CertificateCreatedDate    time.Time `json:"CertificateCreatedDate"`
	CertificateExpirationDate time.Time `json:"CertificateExpirationDate"`
	DaysToExpiry              int       `json:"DaysToExpiry"`
	InUse                     bool      `json:"InUse"`
	Exported                  bool      `json:"Exported"`
}

func (pc *ProjectController) HandleCertificateIssuance() gin.HandlerFunc {
	return func(c *gin.Context) {

		var dto awsEventDto
		if err := c.ShouldBindJSON(&dto); err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		var eventMessage awsEventMessage
		err := json.Unmarshal([]byte(dto.Message), &eventMessage)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		if eventMessage.Detail.Action == "ISSUANCE" {
			err := pc.Service.HandleCertificateIssuance(eventMessage.Resources)
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": err.Error(),
				})
				return
			}
		}

		c.Status(http.StatusOK)
	}
}
