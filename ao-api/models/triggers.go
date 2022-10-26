package models

import (
	"fmt"
	"io/fs"
	"io/ioutil"
	"log"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/sirupsen/logrus"
	"gopkg.in/yaml.v2"
)

var AvaliableTriggers map[string]TriggerDefinition

type TriggerDefinition struct {
	Service          string       `json:"service" yaml:"service"`
	Type             string       `json:"type" yaml:"type"`
	IntegrationTypes []string     `json:"integrations" yaml:"integrations"`
	Image            string       `json:"image" yaml:"image"`
	Credentials      []Credential `json:"credentials" yaml:"credentials"`
	Outputs          []Credential `json:"outputs" yaml:"outputs"`
	Author           string       `json:"author" yaml:"author"`
	Icon             string       `json:"icon" yaml:"icon"`
	NodeColor        string       `json:"node_color" yaml:"node_color"`
	Description      string       `json:"description" yaml:"description"`
	OnTestStage      bool         `json:"on_test_stage" yaml:"on_test_stage"`
	Strategy         string       `json:"deduplication_method" yaml:"deduplication_method"`
}

type Credential struct {
	Key         string `json:"key" yaml:"key"`
	Type        string `json:"type" yaml:"type"`
	Description string `json:"description" yaml:"description"`
	DisplayName string `json:"display_name" yaml:"display_name"`
}

type EventTrigger struct {
	Name        string                 `db:"name" json:"name"`
	AccountId   string                 `db:"account_id" json:"account_id"`
	Type        string                 `db:"type" json:"type"`
	Endpoint    string                 `db:"endpoint" json:"endpoint"`
	Pipeline    string                 `db:"pipeline_name" json:"pipeline_name"`
	Integration string                 `db:"integration" json:"integration"`
	Credentials map[string]interface{} `db:"credentials" json:"credentials"`
	MetaData    TriggerDefinition      `json:"meta_data"`
	ProjectName string                 `db:"project_name" json:"project_name"`
}

func (tr EventTrigger) IsValid() bool {
	if tr.Endpoint == "" {
		return false
	}
	if tr.Pipeline == "" {
		return false
	}
	return true
}

func init() {
	AvaliableTriggers = make(map[string]TriggerDefinition)
	filepath.WalkDir("triggers", walkTriggers)
	err := walkS3Objects(config.Configs.TaskAndTrigger.S3Bucket)
	if err != nil {
		logrus.Error("can't read objects of s3 bucket for triggers, error message:", err.Error())
	}
}

func convertBytesToTriggerDefinition(yamlData []byte) {
	var yamlFile TriggerDefinition
	err := yaml.Unmarshal(yamlData, &yamlFile)
	if err != nil {
		panic(err)
	}
	if yamlFile.Credentials == nil {
		yamlFile.Credentials = make([]Credential, 0)
	}
	if yamlFile.Outputs == nil {
		yamlFile.Outputs = make([]Credential, 0)
	}
	if yamlFile.IntegrationTypes == nil {
		yamlFile.IntegrationTypes = make([]string, 0)
	}
	yamlFile.NodeColor = "#" + yamlFile.NodeColor
	AvaliableTriggers[yamlFile.Type] = yamlFile
}

func walkTriggers(s string, d fs.DirEntry, err error) error {
	if err != nil {
		return err
	}
	if !d.IsDir() {
		yamlData, err := ioutil.ReadFile(s)
		if err != nil {
			panic(err)
		}
		convertBytesToTriggerDefinition(yamlData)
	}
	return nil
}

func walkS3Triggers(bucket string) error {
	cfg := &aws.Config{
		Region: aws.String(config.Configs.Upload.S3Region),
	}
	if config.Configs.App.RunLocally {
		creds := credentials.NewStaticCredentials(config.Configs.Secrets.AwsAccessKeyId, config.Configs.Secrets.AwsSecretAccessKey, "")

		cfg = aws.NewConfig().WithRegion(config.Configs.Upload.S3Region).WithCredentials(creds)
	}
	svc := s3.New(session.New(), cfg)
	pageNum := 0
	s3Objects := make([]S3Object, 0)
	err := svc.ListObjectsV2Pages(&s3.ListObjectsV2Input{Bucket: aws.String(bucket)},
		func(page *s3.ListObjectsV2Output, lastPage bool) bool {
			pageNum++
			for _, item := range page.Contents {
				if strings.HasPrefix(*item.Key, "published_triggers/") {
					s3Objects = append(s3Objects, S3Object{Bucket: bucket, Key: *item.Key})
				}
			}
			return pageNum < 1000
		},
	)
	if err != nil {
		return err
	}
	for _, item := range s3Objects {
		requestInput := &s3.GetObjectInput{
			Bucket: aws.String(item.Bucket),
			Key:    aws.String(item.Key),
		}

		result, err := svc.GetObject(requestInput)
		if err != nil {
			log.Print(err)
		}
		result.GoString()
		body, _ := ioutil.ReadAll(result.Body)
		convertBytesToTriggerDefinition(body)
		fmt.Println(string(body))
		if err != nil {
			return err
		}
	}
	return nil
}
