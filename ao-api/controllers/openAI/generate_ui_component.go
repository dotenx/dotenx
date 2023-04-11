package openai

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func (controller *OpenAIController) GenerateUiComponent() gin.HandlerFunc {
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

		tuneExpr := `
		I represent each html tag in my application with a json object. The whole body of the page is a nested object.
		Each object has a kind which can be one of these values:
		Box, Column, Image, Text, Link, Button, Stack.
		
		Also each object has "data" property which has multiple common and specific properties. A common property in the data property is named "as" which is a valid html tag such as div, image, span, p, that indicates what html element should be rendered.
		The elements have a desktop first style, represented with 'data.style' property which has three properties itself: default, hover, focus. Each of these properties can have any of these properties: desktop, tablet and mobile. "data.style.<default|hover|focus>.<desktop|tablet|mobile>" is an object of string key-pairs representing the css property-values. Use camel case for property names.
		
		Image has two extra properties: "data.src" and "data.alt".
		Link has two extra properties: "data.href" and "data.openInNewTab".
		Text has an extra property: "data.text".
		Button has an extra property: "data.text" which is a string.
		
		The value of data.href in Link and data.text in Text is an object like this:
		value: [ {value: <arbitrary text>, kind: "text"}]
		
		Each element that has nested elements should have a top-level "components" property which is an array of element objects. Components property is not under the "data" property and is at the same level with it.
		
		If the element kind is "Column", the display property should be set to "grid" and it should be set to "flex" with "flexDirection" set to column for "Stack" element.
		
		Now give me the object that represents the HTML code with the following description. Wrap your code section in /*start code*/ and /*end code*/ . Do not provide any explanations before or after the  /*start code*/ and /*end code*/ marks:
		`
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

		componentStr := chatCompletionResponse.Choices[0]["message"].(map[string]interface{})["content"].(string)
		componentStr = strings.TrimPrefix(componentStr, "/*start code*/\n")
		componentStr = strings.TrimSuffix(componentStr, "\n/*end code*/")
		var component map[string]interface{}
		json.Unmarshal([]byte(componentStr), &component)
		chatCompletionResponse.Choices[0]["message"].(map[string]interface{})["content"] = component

		c.JSON(http.StatusOK, chatCompletionResponse)
	}
}
