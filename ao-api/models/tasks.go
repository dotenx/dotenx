package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"io/ioutil"
	"log"
	"os"
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

type TaskBody interface {
	Value() (driver.Value, error)
	Scan(interface{}) error
}

type TaskBodyMap map[string]interface{}

func (t TaskBodyMap) Value() (driver.Value, error) {
	return json.Marshal(t)
}

func (t TaskBodyMap) Scan(value interface{}) error {
	if b, ok := value.([]byte); ok {
		return json.Unmarshal(b, &t)
	} else {
		return errors.New("type assertion to []byte failed")
	}
}

type ReturnValue interface {
	Value() (driver.Value, error)
	Scan(interface{}) error
}

type ReturnValueMap map[string]interface{}

func (t ReturnValueMap) Value() (driver.Value, error) {
	return json.Marshal(t)
}

func (t ReturnValueMap) Scan(value interface{}) error {
	if b, ok := value.([]byte); ok {
		return json.Unmarshal(b, &t)
	} else {
		return errors.New("type assertion to []byte failed")
	}
}

type TaskDetails struct {
	Name        string
	Id          int
	Timeout     int            `db:"timeout" json:"timeout"`
	Type        string         `db:"task_type"`
	AwsLambda   string         `db:"aws_lambda"`
	Body        TaskBodyMap    `db:"body" json:"body"`
	AccountId   string         `db:"account_id" json:"account_id"`
	Integration string         `db:"integration" json:"integration"`
	MetaData    TaskDefinition `json:"meta_data"`
}

type TaskStatusSummery struct {
	Id     int
	Name   string `json:"name"`
	Status string `json:"status"`
}

type TaskResultDto struct {
	TaskId int `json:"task_id"`
	//ExecutionId int    `json:"execution_id"`
	Status      string         `json:"status"`
	AccountId   string         `json:"account_id"`
	Log         string         `json:"log"`
	Error       string         `json:"error"`
	ReturnValue ReturnValueMap `json:"return_value"`
}

func init() {
	AvaliableTasks = make(map[string]TaskDefinition)
	address := "tasks"
	if config.Configs.App.RunLocally && os.Getenv("RUNNING_IN_DOCKER") != "true" { // This is only for the case we run ao-api without docker and locally
		address = "../tasks"
	}
	filepath.WalkDir(address, walkTasks)
	if !config.Configs.App.RunLocally {
		err := walkS3Objects(config.Configs.TaskAndTrigger.S3Bucket)
		if err != nil {
			logrus.Error("can't read objects of s3 bucket for tasks, error message:", err.Error())
		}
	}
}

func convertBytesToTaskDefinition(yamlData []byte) {
	var yamlFile TaskDefinition
	err := yaml.Unmarshal(yamlData, &yamlFile)
	if err != nil {
		panic(err)
	}
	if yamlFile.Fields == nil {
		yamlFile.Fields = make([]TaskField, 0)
	}
	if yamlFile.Outputs == nil {
		yamlFile.Outputs = make([]TaskField, 0)
	}
	if yamlFile.Integrations == nil {
		yamlFile.Integrations = make([]string, 0)
	}
	yamlFile.NodeColor = "#" + yamlFile.NodeColor
	AvaliableTasks[yamlFile.Type] = yamlFile
}

func walkTasks(s string, d fs.DirEntry, err error) error {
	if err != nil {
		return err
	}
	if !d.IsDir() {
		yamlData, err := ioutil.ReadFile(s)
		if err != nil {
			panic(err)
		}
		convertBytesToTaskDefinition(yamlData)
	}
	return nil
}

type S3Object struct {
	Bucket string `json:"bucket"`
	Key    string `json:"key"`
}

func walkS3Objects(bucket string) error {
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
				if strings.HasPrefix(*item.Key, "published_tasks/") {
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
		convertBytesToTaskDefinition(body)
		fmt.Println(string(body))
		if err != nil {
			return err
		}
	}
	return nil
}
