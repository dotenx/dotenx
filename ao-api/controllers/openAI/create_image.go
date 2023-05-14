package openai

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *OpenAIController) CreateImage() gin.HandlerFunc {
	return func(c *gin.Context) {

		type ImageDTO struct {
			Size   string `json:"size" binding:"required,oneof='256x256' '512x512' '1024x1024'"`
			Prompt string `json:"prompt" required:"true"`
		}

		accountId, _ := utils.GetAccountId(c)

		var imageDTO ImageDTO
		if err := c.ShouldBindJSON(&imageDTO); err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		// api reference: https://platform.openai.com/docs/api-reference/images/create
		numberOfImage := 1
		imageCreationUrl := "https://api.openai.com/v1/images/generations"
		imageCreationHeaders := []utils.Header{
			{
				Key:   "Authorization",
				Value: fmt.Sprintf("Bearer %s", config.Configs.Secrets.OpenAiApiKey),
			},
			{
				Key:   "Content-Type",
				Value: "application/json",
			},
		}
		helper := utils.NewHttpHelper(utils.NewHttpClient())
		imageCreationBodyBytes, _ := json.Marshal(map[string]interface{}{
			"prompt": imageDTO.Prompt,
			"size":   imageDTO.Size,
			"n":      numberOfImage,
		})
		out, err, statusCode, _ := helper.HttpRequest(http.MethodPost, imageCreationUrl, bytes.NewBuffer(imageCreationBodyBytes), imageCreationHeaders, 0, true)
		logrus.Info("statusCode here ", statusCode)
		if err != nil || statusCode != http.StatusOK {
			if err == nil {
				err = errors.New("request to openai api wasn't successful")
			}
			logrus.Info(string(imageCreationBodyBytes))
			logrus.Info(string(out))
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		var imageCreationResponse struct {
			Created int64                    `json:"created"`
			Data    []map[string]interface{} `json:"data"`
		}
		err = json.Unmarshal(out, &imageCreationResponse)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		err = submitOpenaiApiUsage(accountId, "", "image", time.Now().Format(time.RFC3339), map[string]interface{}{
			"n":    numberOfImage,
			"size": imageDTO.Size,
		})
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, imageCreationResponse)
	}
}
