package execution

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/lambda"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/dotenx/dotenx/ao-api/services/crudService"
	"github.com/dotenx/dotenx/ao-api/services/integrationService"
	triggerService "github.com/dotenx/dotenx/ao-api/services/triggersService"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

/*
	RunInstantly runs just one task or trigger (invoke Lambda function) based on inputs that
	present in body of request and return results (Lambda response)
*/

type RunInstantlyDto struct {
	Flat     bool            `json:"flat"`
	Manifest models.Manifest `json:"manifest"`
}

func (e *ExecutionController) RunInstantly(cService crudService.CrudService, tService triggerService.TriggerService, iService integrationService.IntegrationService) gin.HandlerFunc {
	return func(c *gin.Context) {

		accountId, _ := utils.GetAccountId(c)
		stepName := c.Param("step_name")
		stepType := c.Param("type")
		if stepType != "task" && stepType != "trigger" {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "invalid type, 'type' should be 'task' or 'trigger'",
			})
			return
		}
		var dto RunInstantlyDto
		if err := c.ShouldBindJSON(&dto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		if stepType == "trigger" {
			targetTrigger := dto.Manifest.Triggers[stepName]
			integration, err := iService.GetIntegrationByName(accountId, targetTrigger.Integration)
			if err != nil {
				logrus.Printf("An error occured when trying to call GetIntegrationByName function in trigger %s and integration %s\n", stepName, targetTrigger.Integration)
				logrus.Error(err.Error())
				return
			}
			img := models.AvaliableTriggers[targetTrigger.Type].Image
			pipelineUrl := fmt.Sprintf("%s/public/execution/ep/%s/start", config.Configs.Endpoints.AoApiLocal, targetTrigger.Endpoint)
			envs := map[string]interface{}{
				"PIPELINE_ENDPOINT": pipelineUrl,
				"TRIGGER_NAME":      stepName,
				"WORKSPACE":         utils.GetNewUuid(),
				"ACCOUNT_ID":        accountId,
			}
			for key, value := range integration.Secrets {
				envs["INTEGRATION_"+key] = value
			}
			for key, value := range targetTrigger.Credentials {
				envs[key] = value
			}
			lambdaResults, err := invokeAwsLambda(img, stepType, envs)
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{
					"message": err.Error(),
				})
				return
			}
			var results interface{}
			results = lambdaResults
			if dto.Flat {
				ended := false
				for !ended {
					ended = true
					results = utils.GetFlatOfInterface(results, &ended)
				}
			}
			c.JSON(http.StatusOK, results)
			return
		} else if stepType == "task" {
			targetTask := dto.Manifest.Tasks[stepName]
			payloadBytes, err := targetTask.Body.Value()
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusBadRequest, gin.H{
					"message": "invalid task body",
				})
				return
			}
			integration, err := iService.GetIntegrationByName(accountId, targetTask.Integration)
			if err != nil {
				logrus.Printf("An error occured when trying to call GetIntegrationByName function in task %s and integration %s\n", targetTask.Name, targetTask.Integration)
				logrus.Error(err.Error())
				return
			}
			payloadBody := make(map[string]interface{})
			json.Unmarshal(payloadBytes.([]byte), &payloadBody)
			for key, value := range integration.Secrets {
				payloadBody["INTEGRATION_"+key] = value
			}
			payload := map[string]interface{}{
				"body": payloadBody,
			}
			lambdaResults, err := invokeAwsLambda(models.AvaliableTasks[targetTask.Type].Image, stepType, payload)
			if err != nil {
				logrus.Error(err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{
					"message": err.Error(),
				})
				return
			}
			var results interface{}
			results = lambdaResults
			if dto.Flat {
				ended := false
				for !ended {
					ended = true
					results = utils.GetFlatOfInterface(results, &ended)
				}
			}
			c.JSON(http.StatusOK, results)
			return
		}
	}
}

func invokeAwsLambda(img, stepType string, envs map[string]interface{}) (response map[string]interface{}, err error) {
	awsRegion := config.Configs.Secrets.AwsRegion
	accessKeyId := config.Configs.Secrets.AwsAccessKeyId
	secretAccessKey := config.Configs.Secrets.AwsSecretAccessKey
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		Config: aws.Config{
			Region:      &awsRegion,
			Credentials: credentials.NewStaticCredentials(accessKeyId, secretAccessKey, string("")),
		},
	}))
	svc := lambda.New(sess)

	lambdaPayload := envs
	payload, err := json.Marshal(lambdaPayload)
	if err != nil {
		logrus.Error("error in json.Marshal: " + err.Error())
		return nil, err
	}
	functionName := strings.ReplaceAll(img, ":", "-")
	functionName = strings.ReplaceAll(functionName, "/", "-")
	logType := "Tail"
	logrus.Info("functionName:", functionName)
	logrus.Info("payload:", string(payload))
	input := &lambda.InvokeInput{
		FunctionName: &functionName,
		Payload:      payload,
		LogType:      &logType,
	}
	lambdaResult, err := svc.Invoke(input)
	if err != nil {
		logrus.Error("error in invoking lambda function: " + err.Error())
		return nil, err
	}
	log.Printf("Full log of function %s:\n%s\n", functionName, lambdaResult.GoString())
	if lambdaResult.LogResult != nil {
		logs, _ := base64.StdEncoding.DecodeString(*lambdaResult.LogResult)
		logrus.Info("function log:", string(logs))
	} else {
		logrus.Info("function payload:", string(lambdaResult.Payload))
	}
	if lambdaResult.FunctionError != nil {
		logrus.Error("error during function execution: " + *lambdaResult.FunctionError)
		return nil, errors.New("error during function execution: " + *lambdaResult.FunctionError)
	}
	if *lambdaResult.StatusCode != http.StatusOK {
		logrus.Error("error after invoking lambda function. status code: " + strconv.Itoa(int(*lambdaResult.StatusCode)))
		return nil, errors.New("error after invoking lambda function. status code: " + strconv.Itoa(int(*lambdaResult.StatusCode)))
	}

	if stepType == "task" || stepType == "trigger" {
		var lambdaResp = make(map[string]interface{})
		err = json.Unmarshal(lambdaResult.Payload, &lambdaResp)
		if err != nil {
			logrus.Error("error while unmarshalling function response: " + err.Error())
			return nil, err
		}
		return lambdaResp, nil
	} else {
		return nil, errors.New("invalid step type, 'type' should be 'task' or 'trigger'")
	}
}
