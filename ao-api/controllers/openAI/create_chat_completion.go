package openai

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *OpenAIController) CreateChatCompletion() gin.HandlerFunc {
	return func(c *gin.Context) {

		type PromptMessage struct {
			Role    string `json:"role" required:"true"`
			Content string `json:"content" required:"true"`
		}

		type ChatDTO struct {
			Messages []PromptMessage `json:"messages" required:"true"`
		}

		accountId, _ := utils.GetAccountId(c)

		var chatDTO ChatDTO
		if err := c.ShouldBindJSON(&chatDTO); err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		if len(chatDTO.Messages) == 0 {
			err := errors.New("invalid body, minimum length of messages is one")
			logrus.Error(err.Error())
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		tuneExpr := ""
		chatDTO.Messages[0].Content = tuneExpr + chatDTO.Messages[0].Content
		// api reference: https://platform.openai.com/docs/api-reference/chat/create
		chatCompletionUrl := "https://api.openai.com/v1/chat/completions"
		chatCompletionHeaders := []utils.Header{
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
		chatCompletionBodyBytes, _ := json.Marshal(map[string]interface{}{
			"model":    config.Configs.App.OpenAiChatModel,
			"messages": chatDTO.Messages,
		})
		out, err, statusCode, _ := helper.HttpRequest(http.MethodPost, chatCompletionUrl, bytes.NewBuffer(chatCompletionBodyBytes), chatCompletionHeaders, 0, true)
		logrus.Info("statusCode here ", statusCode)
		if err != nil || statusCode != http.StatusOK {
			if err == nil {
				err = errors.New("request to openai api wasn't successful")
			}
			logrus.Info(string(chatCompletionBodyBytes))
			logrus.Info(string(out))
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		var chatCompletionResponse struct {
			Id      string                   `json:"id"`
			Object  string                   `json:"object"`
			Model   string                   `json:"model"`
			Created int64                    `json:"created"`
			Usage   map[string]interface{}   `json:"usage"`
			Choices []map[string]interface{} `json:"choices"`
		}
		err = json.Unmarshal(out, &chatCompletionResponse)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		err = submitOpenaiApiUsage(accountId, config.Configs.App.OpenAiChatModel, "chat", time.Now().Format(time.RFC3339), chatCompletionResponse.Usage)
		if err != nil {
			logrus.Error(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, chatCompletionResponse)
	}
}

func submitOpenaiApiUsage(accountId, model, useCase, calledAt string, usage map[string]interface{}) error {
	usageBytes, _ := json.Marshal(usage)
	dt := OpenaiApiUsageDto{
		AccountId: accountId,
		Model:     model,
		UseCase:   useCase,
		CalledAt:  calledAt,
		Usage:     usageBytes,
	}
	logrus.Println(dt)
	json_data, err := json.Marshal(dt)
	if err != nil {
		return errors.New("bad input body")
	}
	requestBody := bytes.NewBuffer(json_data)
	token, err := utils.GeneratToken()
	if err != nil {
		return err
	}
	Requestheaders := []utils.Header{
		{
			Key:   "Authorization",
			Value: token,
		},
		{
			Key:   "Content-Type",
			Value: "application/json",
		},
	}
	httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
	url := config.Configs.Endpoints.Admin + "/internal/openai/usage"
	out, err, status, _ := httpHelper.HttpRequest(http.MethodPost, url, requestBody, Requestheaders, time.Minute, true)
	if err != nil {
		return err
	}
	if status != http.StatusOK && status != http.StatusAccepted {
		logrus.Println(string(out))
		return errors.New("not ok with status: " + strconv.Itoa(status))
	}
	return nil
}

type OpenaiApiUsageDto struct {
	AccountId string          `json:"account_id" binding:"required"`
	Model     string          `json:"model" binding:"-"`
	UseCase   string          `json:"use_case" binding:"required"`
	CalledAt  string          `json:"called_at" binding:"-"`
	Usage     json.RawMessage `json:"usage" binding:"-"`
}
