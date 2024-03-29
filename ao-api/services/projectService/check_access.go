package projectService

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

func (ps *projectService) CheckCreateProjectAccess(accountId, projectType string) (bool, error) {
	dto := projectDto{
		AccountId:   accountId,
		ProjectType: projectType,
	}
	json_data, err := json.Marshal(dto)
	if err != nil {
		return false, errors.New("bad input body")
	}
	requestBody := bytes.NewBuffer(json_data)
	token, err := utils.GeneratToken()
	if err != nil {
		return false, err
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
	url := config.Configs.Endpoints.Admin + "/internal/user/access/project"
	out, err, status, _ := httpHelper.HttpRequest(http.MethodPost, url, requestBody, Requestheaders, time.Minute, true)
	if err != nil {
		return false, err
	}
	// if admin-api retrun 403 as status code, this shows there isn't any error so we return nil as error
	if status == http.StatusForbidden {
		return false, nil
	}
	if status != http.StatusOK && status != http.StatusAccepted {
		logrus.Println(string(out))
		return false, errors.New("not ok with status: " + strconv.Itoa(status))
	}
	var res struct {
		Access bool `json:"access"`
	}
	if err := json.Unmarshal(out, &res); err != nil {
		return false, err
	}

	return res.Access, nil
}

func (ps *projectService) CheckCreateDatabaseAccess(accountId string) (bool, error) {
	// NOTE: currently we ignore limitation because body of this request should change based on project type and other changes for getting list of databases
	// dto := projectDto{
	// 	AccountId: accountId,
	// }
	// json_data, err := json.Marshal(dto)
	// if err != nil {
	// 	return false, errors.New("bad input body")
	// }
	// requestBody := bytes.NewBuffer(json_data)
	// token, err := utils.GeneratToken()
	// if err != nil {
	// 	return false, err
	// }
	// Requestheaders := []utils.Header{
	// 	{
	// 		Key:   "Authorization",
	// 		Value: token,
	// 	},
	// 	{
	// 		Key:   "Content-Type",
	// 		Value: "application/json",
	// 	},
	// }
	// httpHelper := utils.NewHttpHelper(utils.NewHttpClient())
	// url := config.Configs.Endpoints.Admin + "/internal/user/access/database"
	// out, err, status, _ := httpHelper.HttpRequest(http.MethodPost, url, requestBody, Requestheaders, time.Minute, true)
	// if err != nil {
	// 	return false, err
	// }
	// //fmt.Println(string(out))
	// if status != http.StatusOK && status != http.StatusAccepted {
	// 	logrus.Println(string(out))
	// 	return false, errors.New("not ok with status: " + strconv.Itoa(status))
	// }
	// var res struct {
	// 	Access bool `json:"access"`
	// }
	// if err := json.Unmarshal(out, &res); err != nil {
	// 	return false, err
	// }

	// return res.Access, nil
	return true, nil
}

func (ps *projectService) CheckCreateDomainAccess(accountId, projectType string) (bool, error) {
	dto := projectDto{
		AccountId:   accountId,
		ProjectType: projectType,
	}
	json_data, err := json.Marshal(dto)
	if err != nil {
		return false, errors.New("bad input body")
	}
	requestBody := bytes.NewBuffer(json_data)
	token, err := utils.GeneratToken()
	if err != nil {
		return false, err
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
	url := config.Configs.Endpoints.Admin + "/internal/user/access/domain"
	out, err, status, _ := httpHelper.HttpRequest(http.MethodPost, url, requestBody, Requestheaders, time.Minute, true)
	if err != nil {
		return false, err
	}
	// if admin-api retrun 403 as status code, this shows there isn't any error so we return nil as error
	if status == http.StatusForbidden {
		return false, nil
	}
	if status != http.StatusOK && status != http.StatusAccepted {
		logrus.Println(string(out))
		return false, errors.New("not ok with status: " + strconv.Itoa(status))
	}
	var res struct {
		Access bool `json:"access"`
	}
	if err := json.Unmarshal(out, &res); err != nil {
		return false, err
	}

	return res.Access, nil
}

type projectDto struct {
	AccountId   string `json:"account_id" binding:"required"`
	ProjectType string `json:"project_type" binding:"required"`
}
