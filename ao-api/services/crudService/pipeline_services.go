package crudService

import (
	"bytes"
	"crypto/md5"
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/miniTasks"
	"github.com/dotenx/dotenx/ao-api/models"
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
	//preparedTasks := make(map[string]models.Task)
	for _, task := range tasks {
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
				if fmt.Sprintf("%v", value) == "" {
					val := insertDto{
						Source: config.Configs.App.InteractionBodyKey,
						Key:    key,
					}
					body[key] = val
				}
			}
		}
		if task.Type == "Run node code" || task.Type == "Run mini tasks" {
			var code, dependency string
			if task.Type == "Run mini tasks" {
				importStore := miniTasks.NewImportStore()
				body := make(map[string]interface{})
				bodyVal, _ := task.Body.Value()
				_ = json.Unmarshal(bodyVal.([]byte), &body)
				parsed := body["tasks"].(map[string]interface{})
				gcode, err := miniTasks.ConvertToCode(parsed["steps"].([]interface{}), &importStore)
				if err != nil {
					return nil, err
				}
				code = fmt.Sprintf("module.exports = () => {\n%s\n}", gcode)
				dependency = "{}"
			} else {
				body := make(map[string]interface{})
				bodyVal, _ := task.Body.Value()
				_ = json.Unmarshal(bodyVal.([]byte), &body)
				code = body["code"].(string)
				dependency = body["dependency"].(string)
			}
			log.Println("code:", code)
			log.Println("dependency:", dependency)
			codeMd5Hashed := md5.Sum([]byte(code))
			dependencyMd5Hashed := md5.Sum([]byte(dependency))
			codeFileName := fmt.Sprintf("%x", codeMd5Hashed) + "_code"
			dependencyFileName := fmt.Sprintf("%x", dependencyMd5Hashed) + "_dependency"

			// upload file to s3
			sess, err := session.NewSession(&aws.Config{
				Region: aws.String("us-east-1")}, // todo: use a variable for this
			)
			if err != nil {
				return nil, err
			}
			bucketName := "dotenx" // Todo: use a variable for this

			// Setup the S3 Upload Manager. Also see the SDK doc for the Upload Manager
			// for more information on configuring part size, and concurrency.
			//
			// http://docs.aws.amazon.com/sdk-for-go/api/service/s3/s3manager/#NewUploader
			uploader := s3manager.NewUploader(sess)
			_, err = uploader.Upload(&s3manager.UploadInput{
				Bucket: aws.String(bucketName),
				Key:    aws.String(codeFileName),
				Body:   bytes.NewReader([]byte(code)),
			})
			if err != nil {
				return nil, err
			}
			_, err = uploader.Upload(&s3manager.UploadInput{
				Bucket: aws.String(bucketName),
				Key:    aws.String(dependencyFileName),
				Body:   bytes.NewReader([]byte(dependency)),
			})
			if err != nil {
				return nil, err
			}
		}
	}
	return tasks, nil
}
