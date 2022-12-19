package cmd

import (
	"bytes"
	"dotenx-cli/config"
	"dotenx-cli/models"
	"dotenx-cli/utils"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/lambda"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	cp "github.com/otiai10/copy"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"gopkg.in/yaml.v2"
)

var deployCmd = &cobra.Command{
	Use:   "deploy",
	Short: "deploy function",
	Long:  `deploy command deployes your function locally and prints outputs`,
	Run: func(cmd *cobra.Command, args []string) {
		language, _ := cmd.Flags().GetString("language")
		path, _ := cmd.Flags().GetString("path")
		functionName, _ := cmd.Flags().GetString("function")
		defPath, _ := cmd.Flags().GetString("definition_path")
		functionType, _ := cmd.Flags().GetString("type")
		accessToken := viper.GetString("DOTENX_ACCESS_TOKEN")
		templateData := make([]byte, 0)
		handler := ""
		handlerCode := ""
		runtime := ""
		lambdaName := ""

		fmt.Println("creating temporary directory...")
		newDirPath, err := os.MkdirTemp("", "*")
		if err != nil {
			fmt.Println(err.Error())
			return
		}
		fmt.Println("copy some files...")
		err = cp.Copy(path, newDirPath+"/service", cp.Options{AddPermission: os.FileMode(int(0777))})
		if err != nil {
			fmt.Println(err.Error())
			return
		}

		switch language {
		case "go":
			runtime = "go1.x"
			handler = "main"
			templateData = []byte(config.GO_SAM_TEMPLATE)
			handlerCode = fmt.Sprintf(`
			package main

			import (
				"github.com/aws/aws-lambda-go/lambda"
			)

			func main() {
				lambda.Start(%s)
			}
			`, functionName)
			err = os.WriteFile(newDirPath+"/service/main.go", []byte(handlerCode), 0777)
			if err != nil {
				fmt.Println(err.Error())
				return
			}
			fmt.Println("running 'go mod tidy' command...")
			goModCmd := exec.Command("go", "mod", "tidy")
			goModCmd.Dir = newDirPath + "/service"
			goModOutput, err := goModCmd.Output()
			fmt.Println(string(goModOutput))
			if err != nil {
				fmt.Println(err.Error())
				return
			}

			runExportCommand("GOOS", "linux", newDirPath)
			fmt.Println("running 'go build' command...")
			goBuildCmd := exec.Command("go", "build", "main")
			goBuildCmd.Dir = newDirPath + "/service"
			err = goBuildCmd.Run()
			if err != nil {
				fmt.Println(err.Error())
				return
			}

			zipCmd := exec.Command("zip", "function.zip", "main")
			zipCmd.Dir = newDirPath + "/service"
			_, err = zipCmd.Output()
			if err != nil {
				fmt.Println(err.Error())
				return
			}
		}
		os.WriteFile(newDirPath+"/template.yaml", templateData, 0777)
		fmt.Println("Source Code Path:", string(path))
		fmt.Println("Language:", string(language))
		fmt.Println("Definition Path:", defPath)

		// fmt.Println("sam init...")
		// fmt.Println("new directory path:", newDirPath)
		// initCmd := exec.Command("sam", "init")
		// initCmd.Dir = newDirPath
		// initOutStr, err := initCmd.Output()
		// fmt.Println(string(initOutStr))
		// fmt.Println("err:", err)
		// if err != nil {
		// 	fmt.Println(string(initOutStr))
		// 	return
		// }

		// fmt.Println("sam build...")
		// buildCmd := exec.Command("sam", "build")
		// buildCmd.Dir = newDirPath
		// buildOutStr, err := buildCmd.Output()
		// if err != nil {
		// 	fmt.Println(string(buildOutStr))
		// 	return
		// }

		fmt.Println("reading definition file of task/trigger...")
		if functionType == "task" {
			taskDef, readErr := readTaskFile(defPath)
			if readErr != nil {
				fmt.Println(readErr.Error())
				return
			}
			lambdaName = strings.ReplaceAll(taskDef.Image, ":", "-")
			lambdaName = strings.ReplaceAll(lambdaName, "/", "-")
		} else if functionType == "trigger" {
			triggerDef, readErr := readTriggerFile(defPath)
			if readErr != nil {
				fmt.Println(readErr.Error())
				return
			}
			lambdaName = strings.ReplaceAll(triggerDef.Image, ":", "-")
			lambdaName = strings.ReplaceAll(lambdaName, "/", "-")
		} else {
			fmt.Println("unsupported function type, choose 'task' or 'trigger' for this field")
			return
		}

		fmt.Println("running pre processing tasks...")
		httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
		url := config.DOTENX_API_URL + "/marketplace/credential/temporary"
		headers := []utils.Header{
			{
				Key:   "DTX-auth",
				Value: accessToken,
			},
		}
		body := map[string]interface{}{
			"use_case": "deploy_function",
		}
		bodyBytes, _ := json.Marshal(body)
		out, err, statusCode, _ := httpHelper.HttpRequest(http.MethodPost, url, bytes.NewBuffer(bodyBytes), headers, 0, true)
		if statusCode != http.StatusOK || err != nil {
			if err == nil {
				err = errors.New("can't get credentials now, please try again later")
			}
			fmt.Println(err.Error())
			return
		}
		var creds models.Credentials
		err = json.Unmarshal(out, &creds)
		if err != nil {
			fmt.Println(err.Error())
			return
		}

		hasAccess, exists, _, err := getFunction(lambdaName, accessToken)
		if err != nil {
			fmt.Println(err.Error())
			return
		}
		if !hasAccess {
			fmt.Println("you haven't access to this function")
			return
		}
		// DefinitionFileName := strings.TrimSuffix(filepath.Base(defPath), filepath.Ext(filepath.Base(defPath))) + "-" + utils.RandStringRunes(8, utils.FullRunes) + filepath.Ext(filepath.Base(defPath))
		DefinitionFileName := lambdaName + filepath.Ext(filepath.Base(defPath))
		newFunction := models.Function{
			Name:           lambdaName,
			DefinitionFile: DefinitionFileName,
			Type:           functionType,
		}

		awsRegion := config.AWS_REGION
		accessKeyId := creds.AccessKeyId
		secretAccessKey := creds.SecretAccessKey
		sessToken := creds.SessionToken
		sess := session.Must(session.NewSessionWithOptions(session.Options{
			Config: aws.Config{
				Region:      &awsRegion,
				Credentials: credentials.NewStaticCredentials(accessKeyId, secretAccessKey, sessToken),
			},
		}))

		definitionContents, err := ioutil.ReadFile(defPath)
		if err != nil {
			fmt.Println(err.Error())
			return
		}
		// fmt.Println("deleting old yaml file")
		// if oldFunction.DefinitionFile != "" {
		// 	s3svc := s3.New(sess)
		// 	_, err := s3svc.DeleteObject(&s3.DeleteObjectInput{
		// 		Bucket: aws.String(config.AWS_S3_BUCKET_NAME),
		// 		Key:    aws.String(fmt.Sprintf("%s/%s", functionType, DefinitionFileName)),
		// 	})
		// 	if err != nil {
		// 		fmt.Println(err.Error())
		// 		return
		// 	}
		// }
		uploader := s3manager.NewUploader(sess)
		fmt.Println("uploading file(s)...")
		_, err = uploader.Upload(&s3manager.UploadInput{
			Bucket: aws.String(config.AWS_S3_BUCKET_NAME),
			Key:    aws.String(fmt.Sprintf("published_%ss/%s", functionType, DefinitionFileName)),
			Body:   bytes.NewReader(definitionContents),
		})
		if err != nil {
			fmt.Println(err.Error())
			return
		}

		contents, err := ioutil.ReadFile(newDirPath + "/service/function.zip")
		if err != nil {
			fmt.Println(err.Error())
			return
		}

		if !exists {
			fmt.Println("creating function...")
			err = createFunction(newFunction, accessToken)
			if err != nil {
				fmt.Println(err.Error())
				return
			}
			createCode := &lambda.FunctionCode{
				ZipFile: contents,
			}
			createArgs := &lambda.CreateFunctionInput{
				Code:         createCode,
				FunctionName: aws.String(lambdaName),
				Handler:      aws.String(handler),
				Role:         aws.String(config.AWS_LAMBDA_ROLE_ARN),
				Runtime:      aws.String(runtime),
				Timeout:      aws.Int64(10),
			}
			svc := lambda.New(sess)
			_, err = svc.CreateFunction(createArgs)
			if err != nil {
				fmt.Println(err.Error())
				return
			}
		} else {
			fmt.Println("updating function...")
			err = updateFunction(newFunction, accessToken)
			if err != nil {
				fmt.Println(err.Error())
				return
			}
			updateArgs := &lambda.UpdateFunctionCodeInput{
				FunctionName: aws.String(lambdaName),
				ZipFile:      contents,
			}
			svc := lambda.New(sess)
			_, err = svc.UpdateFunctionCode(updateArgs)
			if err != nil {
				fmt.Println(err.Error())
				return
			}
		}
		fmt.Println("Function deployed successfully")

		// runExportCommand("AWS_ACCESS_KEY_ID", creds.AccessKeyId, newDirPath)
		// runExportCommand("AWS_SECRET_ACCESS_KEY", creds.SecretAccessKey, newDirPath)
		// runExportCommand("AWS_SESSION_TOKEN", creds.SessionToken, newDirPath)
		// runExportCommand("AWS_DEFAULT_REGION", config.AWS_REGION, newDirPath)
		// fmt.Println("sam deploy...")
		// samRunCmd := exec.Command("sam", "deploy", "-t", newDirPath+"/deploy.yaml")
		// samRunCmd.Dir = newDirPath
		// samRunOutStr, err := samRunCmd.Output()
		// fmt.Println(err.Error())
		// fmt.Println(string(samRunOutStr))
		// if err != nil {
		// 	return
		// }
	},
}

func init() {
	rootCmd.AddCommand(deployCmd)
	deployCmd.Flags().StringP("language", "l", "", "language name [go, node]")
	deployCmd.Flags().StringP("function", "f", "", "function name")
	deployCmd.Flags().StringP("path", "p", "", "the path to a directory where the source codes are stored")
	deployCmd.Flags().StringP("definition_path", "d", "", "the path to a file where the definition of task/trigger stored (in yaml format)")
	deployCmd.Flags().StringP("type", "t", "", "type of your function ('task' or 'trigger')")
}

func runExportCommand(key, value, path string) {
	exportCmd := exec.Command("export", fmt.Sprintf("%s=%s", key, value))
	exportCmd.Dir = path
	exportCmd.Run()
}

func readTaskFile(addr string) (tDef models.TaskDefinition, err error) {
	var yamlFile models.TaskDefinition
	yamlData, err := ioutil.ReadFile(addr)
	if err != nil {
		return models.TaskDefinition{}, err
	}
	err = yaml.Unmarshal(yamlData, &yamlFile)
	if err != nil {
		return models.TaskDefinition{}, err
	}
	if yamlFile.Fields == nil {
		yamlFile.Fields = make([]models.TaskField, 0)
	}
	if yamlFile.Outputs == nil {
		yamlFile.Outputs = make([]models.TaskField, 0)
	}
	if yamlFile.Integrations == nil {
		yamlFile.Integrations = make([]string, 0)
	}
	yamlFile.NodeColor = "#" + yamlFile.NodeColor
	tDef = yamlFile
	return
}

func readTriggerFile(address string) (tDef models.TriggerDefinition, err error) {
	var yamlFile models.TriggerDefinition
	yamlData, err := ioutil.ReadFile(address)
	if err != nil {
		return models.TriggerDefinition{}, err
	}
	err = yaml.Unmarshal(yamlData, &yamlFile)
	if err != nil {
		return models.TriggerDefinition{}, err
	}
	if yamlFile.Credentials == nil {
		yamlFile.Credentials = make([]models.Credential, 0)
	}
	if yamlFile.Outputs == nil {
		yamlFile.Outputs = make([]models.Credential, 0)
	}
	if yamlFile.IntegrationTypes == nil {
		yamlFile.IntegrationTypes = make([]string, 0)
	}
	yamlFile.NodeColor = "#" + yamlFile.NodeColor
	tDef = yamlFile
	return
}

func getFunction(name, accessToken string) (access, exist bool, function models.Function, err error) {
	httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
	url := config.DOTENX_API_URL + "/marketplace/function/" + name
	headers := []utils.Header{
		{
			Key:   "DTX-auth",
			Value: accessToken,
		},
	}
	out, reqErr, statusCode, _ := httpHelper.HttpRequest(http.MethodGet, url, nil, headers, 0, true)
	if statusCode != http.StatusOK || reqErr != nil {
		if reqErr == nil {
			err = errors.New("can't get function info now, please try again later")
		}
		if statusCode == http.StatusForbidden {
			err = errors.New("you haven't access to this function")
		}
		return
	}
	type respType struct {
		Access   bool            `json:"access"`
		Exist    bool            `json:"exist"`
		Function models.Function `json:"function"`
	}
	var resp respType
	err = json.Unmarshal(out, &resp)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	// fmt.Println(string(out))
	access = resp.Access
	exist = resp.Exist
	function = resp.Function
	return
}

func createFunction(function models.Function, accessToken string) (err error) {
	httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
	url := config.DOTENX_API_URL + "/marketplace/function"
	headers := []utils.Header{
		{
			Key:   "DTX-auth",
			Value: accessToken,
		},
	}
	bodyBytes, _ := json.Marshal(function)
	_, reqErr, statusCode, _ := httpHelper.HttpRequest(http.MethodPost, url, bytes.NewBuffer(bodyBytes), headers, 0, true)
	if statusCode != http.StatusOK || reqErr != nil {
		if reqErr == nil {
			err = errors.New("can't create function right now, please try again later")
		}
		return
	}
	return
}

func updateFunction(function models.Function, accessToken string) (err error) {
	httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
	url := config.DOTENX_API_URL + "/marketplace/function"
	headers := []utils.Header{
		{
			Key:   "DTX-auth",
			Value: accessToken,
		},
	}
	bodyBytes, _ := json.Marshal(function)
	// fmt.Println("bodyBytes:", string(bodyBytes))
	_, reqErr, statusCode, _ := httpHelper.HttpRequest(http.MethodPut, url, bytes.NewBuffer(bodyBytes), headers, 0, true)
	if statusCode != http.StatusOK || reqErr != nil {
		if reqErr == nil {
			err = errors.New("can't update function right now, please try again later")
		}
		if statusCode == http.StatusForbidden {
			err = errors.New("you haven't access to update this function")
		}
		return
	}
	return
}
