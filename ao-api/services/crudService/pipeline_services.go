package crudService

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/lambda"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/miniTasks"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	cp "github.com/otiai10/copy"
	"github.com/sirupsen/logrus"
)

func (cm *crudManager) CreatePipeLine(base *models.Pipeline, pipeline *models.PipelineVersion, isTemplate bool, isInteraction bool) (err error) {
	pipeline.Manifest.Tasks, err = cm.prepareTasks(pipeline.Manifest.Tasks, base.AccountId, isTemplate, isInteraction)
	if err != nil {
		return err
	}
	err = cm.Store.Create(noContext, base, pipeline, isTemplate, isInteraction)
	if err != nil {
		return
	}
	p, err := cm.Store.GetByName(noContext, base.AccountId, base.Name)
	if err != nil {
		return
	}
	triggers, err := cm.getTriggersArray(pipeline.Manifest.Triggers, base.Name, p.Endpoint, base.AccountId, p.IsTemplate)
	if err != nil {
		return
	}
	return cm.TriggerService.AddTriggers(base.AccountId, triggers, p.Endpoint)
}

func (cm *crudManager) UpdatePipeline(base *models.Pipeline, pipeline *models.PipelineVersion) error {
	p, err := cm.Store.GetByName(noContext, base.AccountId, base.Name)
	if err != nil || p.PipelineDetailes.Id == "" {
		return errors.New("your Automation has not been saved yet")
	}
	err = cm.DeletePipeline(base.AccountId, base.Name, true)
	if err != nil {
		return errors.New("error in deleting old version: " + err.Error())
	}
	pipeline.Manifest.Tasks, err = cm.prepareTasks(pipeline.Manifest.Tasks, base.AccountId, p.IsTemplate, p.IsInteraction)
	if err != nil {
		return err
	}
	err = cm.Store.Create(noContext, base, pipeline, p.IsTemplate, p.IsInteraction)
	if err != nil {
		return errors.New("error in creating new version: " + err.Error())
	}
	newP, err := cm.GetPipelineByName(base.AccountId, base.Name)
	if err != nil {
		log.Println(err)
		return err
	}
	if p.IsActive {
		err := cm.ActivatePipeline(base.AccountId, newP.PipelineDetailes.Id)
		if err != nil {
			log.Println(err)
			return err
		}
	}
	triggers, err := cm.getTriggersArray(pipeline.Manifest.Triggers, base.Name, newP.Endpoint, base.AccountId, newP.IsTemplate)
	if err != nil {
		return err
	}
	return cm.TriggerService.UpdateTriggers(base.AccountId, triggers, newP.Endpoint)
}

func (cm *crudManager) GetPipelineByName(accountId string, name string) (models.PipelineSummery, error) {
	pipe, err := cm.Store.GetByName(noContext, accountId, name)
	if err != nil {
		return models.PipelineSummery{}, err
	}
	triggers, err := cm.TriggerService.GetAllTriggersForPipeline(accountId, name)
	if err != nil {
		return models.PipelineSummery{}, err
	}
	pipe.PipelineDetailes.Manifest.Triggers = make(map[string]models.EventTrigger)
	for _, tr := range triggers {
		pipe.PipelineDetailes.Manifest.Triggers[tr.Name] = tr
	}
	return pipe, nil
}

func (cm *crudManager) GetPipelines(accountId string) ([]models.Pipeline, error) {
	return cm.Store.GetPipelines(noContext, accountId)
}

func (cm *crudManager) DeletePipeline(accountId, name string, deleteRecord bool) (err error) {
	p, err := cm.GetPipelineByName(accountId, name)
	if err != nil {
		return
	}
	if p.IsActive {
		err = cm.DeActivatePipeline(accountId, p.PipelineDetailes.Id, deleteRecord)
		if err != nil {
			return
		}
	}
	return cm.Store.DeletePipeline(noContext, accountId, name)
}

func (cm *crudManager) GetAllExecutions(accountId string, name string) ([]models.Execution, error) {
	pipelineId, err := cm.Store.GetPipelineId(noContext, accountId, name)
	if err != nil {
		return nil, err
	}
	return cm.Store.GetAllExecutions(noContext, pipelineId)
}

type automationDto struct {
	AccountId    string `json:"account_id" binding:"required"`
	AutomationId string `json:"automation_id" binding:"required"`
	DeleteRecord bool   `json:"delete_record"`
}

type insertDto struct {
	Source string `json:"source"`
	Key    string `json:"key"`
}

// checks trigger integration for templates and also convert trigger map to array of triggers
func (cm *crudManager) getTriggersArray(triggers map[string]models.EventTrigger, pipelineName, endpoint, accountId string, isTemplate bool) ([]*models.EventTrigger, error) {
	arr := make([]*models.EventTrigger, 0)
	for _, tr := range triggers {
		// check integration provider if it is a template
		if tr.Integration != "" && isTemplate {
			integration, err := cm.IntegrationService.GetIntegrationByName(accountId, tr.Integration)
			if err != nil {
				return nil, err
			}
			if integration.Provider == "" {
				return nil, errors.New("your integrations must have provider")

			}
		}
		arr = append(arr, &models.EventTrigger{
			Name:        tr.Name,
			AccountId:   tr.AccountId,
			Type:        tr.Type,
			Endpoint:    endpoint,
			Pipeline:    pipelineName,
			Integration: tr.Integration,
			Credentials: tr.Credentials,
		})
	}
	return arr, nil
}

// checks tasks integration for templates and also change empty task field values to get value from run time data for interactions
func (cm *crudManager) prepareTasks(tasks map[string]models.Task, accountId string, isTemplate, isInteraction bool) (map[string]models.Task, error) {
	preparedTasks := make(map[string]models.Task)
	for tName, task := range tasks {
		pTask := task
		if task.Integration != "" && (isInteraction || isTemplate) {
			integration, err := cm.IntegrationService.GetIntegrationByName(accountId, task.Integration)
			if err != nil {
				return nil, err
			}
			if integration.Provider == "" {
				return nil, errors.New("your integrations must have provider")
			}
		}
		if isInteraction {
			body := task.Body.(models.TaskBodyMap)
			for key, value := range body {
				var insertDt models.TaskFieldDetailes
				b, _ := json.Marshal(value)
				err := json.Unmarshal(b, &insertDt)
				if err != nil {
					return nil, err
				}
				if insertDt.Type == models.DirectValueFieldType && fmt.Sprintf("%v", insertDt.Value) == "" {
					val := models.TaskFieldDetailes{
						Type:      models.NestedFieldType,
						NestedKey: fmt.Sprintf("%s[0].%s", config.Configs.App.InteractionBodyKey, key),
					}
					body[key] = val
				}
			}
		}
		if task.Type == "Run node code" || task.Type == "Run mini tasks" {
			var code, dependency string
			if task.Type == "Run mini tasks" {
				importStore := miniTasks.NewImportStore()
				body := make(map[string]models.TaskFieldDetailes)
				bodyVal, _ := task.Body.Value()
				err := json.Unmarshal(bodyVal.([]byte), &body)
				if err != nil {
					logrus.Error(err)
					return nil, err
				}
				parsed := body["tasks"].Value.(map[string]interface{})
				gcode, err := miniTasks.ConvertToCode(parsed["steps"].([]interface{}), &importStore)
				if err != nil {
					return nil, err
				}
				code = fmt.Sprintf("module.exports = () => {\n%s\n}", gcode)
				dependency = "{}"
			} else {
				body := make(map[string]models.TaskFieldDetailes)
				bodyVal, _ := task.Body.Value()
				err := json.Unmarshal(bodyVal.([]byte), &body)
				if err != nil {
					logrus.Error(err)
					return nil, err
				}
				code = body["code"].Value.(string)
				dependency = body["dependency"].Value.(string)
			}
			log.Println("code:", code)
			log.Println("dependency:", dependency)
			functionName, err := createLambdaFunction(code, dependency)
			if err != nil {
				return nil, err
			}
			pTask.AwsLambda = functionName
		}
		preparedTasks[tName] = pTask
	}
	return preparedTasks, nil
}

func createLambdaFunction(code, dependency string) (functionName string, err error) {
	path, err := os.MkdirTemp("", "*")
	if err != nil {
		log.Println(err.Error())
		return "", err
	}
	log.Println("Path is", path)
	defer os.RemoveAll(path)
	err = os.WriteFile(path+"/entry.js", []byte(code), 0777)
	if err != nil {
		return
	}
	err = os.WriteFile(path+"/package.json", []byte(dependency), 0777)
	if err != nil {
		return
	}
	// exec.Command("cd", path)
	npmCmd := exec.Command("npm", "install")
	npmCmd.Dir = path
	npmOutput, err := npmCmd.Output()
	if err != nil {
		return
	}
	log.Println(string(npmOutput))

	err = cp.Copy("pkg/utils/functions", path+"/functions", cp.Options{AddPermission: os.FileMode(int(0777))})
	if err != nil {
		return
	}

	indexJs := `
	exports.handler = async function (event) {
		
		console.log("event:", JSON.stringify(event));
		
		const filePath = event.code;
		const dependenciesPath = event.dependency;
		const resultEndpoint = event.RESULT_ENDPOINT;
		const Aauthorization = event.AUTHORIZATION;
		// Read function arguments from environment variables based on VARIABLE
		const variables = (event.VARIABLES || '').split(',').map(v => event[v.trim()])
	  
		console.log("Function Arguments:", variables);

		const f = require('entry.js');
		const result = await f(...variables) || {};
		
		console.log("result set successfully")
		return {
		successfull: true,
		status: "completed",
		return_value: result
		}
	}
	`
	err = os.WriteFile(path+"/index.js", []byte(indexJs), 0777)
	if err != nil {
		return
	}

	chmodCmd := exec.Command("chmod", "-R", "777", ".")
	chmodCmd.Dir = path
	err = chmodCmd.Run()
	if err != nil {
		return
	}

	zipCmd := exec.Command("zip", "-r", "function.zip", ".")
	zipCmd.Dir = path
	_, err = zipCmd.Output()
	if err != nil {
		return
	}

	awsRegion := config.Configs.Secrets.AwsRegion
	accessKeyId := config.Configs.Secrets.AwsAccessKeyId
	secretAccessKey := config.Configs.Secrets.AwsSecretAccessKey
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		Config: aws.Config{
			Region:      &awsRegion,
			Credentials: credentials.NewStaticCredentials(accessKeyId, secretAccessKey, string("")),
		},
	}))

	contents, err := ioutil.ReadFile(path + "/function.zip")
	createCode := &lambda.FunctionCode{
		//      S3Bucket:        bucket,
		//      S3Key:           zipFile,
		//      S3ObjectVersion: aws.String("1"),
		ZipFile: contents,
	}

	functionName = "run-node-code-" + utils.RandStringRunes(8, utils.FullRunes)
	createArgs := &lambda.CreateFunctionInput{
		Code:         createCode,
		FunctionName: &functionName,
		Handler:      aws.String("index.handler"),
		Role:         aws.String("arn:aws:iam::994147050565:role/lambda-ex"),
		Runtime:      aws.String("nodejs16.x"),
	}
	svc := lambda.New(sess)
	_, err = svc.CreateFunction(createArgs)
	return functionName, err
}
