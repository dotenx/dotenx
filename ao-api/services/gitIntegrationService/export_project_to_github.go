package gitIntegrationService

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

func (service *gitIntegrationService) ExportProjectToGithub(accessToken, gitUsername, repoFullName, branchName, commitMessage string, content interface{}) error {
	headers := []utils.Header{
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", accessToken),
		},
	}
	helper := utils.NewHttpHelper(utils.NewHttpClient())
	lastCommitUrl := fmt.Sprintf("https://api.github.com/repos/%s/branches/%s", repoFullName, branchName)
	out, err, statusCode, _ := helper.HttpRequest(http.MethodGet, lastCommitUrl, nil, headers, 0, true)
	logrus.Trace("url:", lastCommitUrl)
	logrus.Info("statusCode here:", statusCode)
	if err != nil || statusCode != http.StatusOK {
		logrus.Info(string(out))
		if err == nil {
			err = errors.New("request to Github api wasn't successful")
		}
		logrus.Error(err.Error())
		return err
	}
	branchInfo := make(map[string]interface{})
	err = json.Unmarshal(out, &branchInfo)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	lastCommitSHA := branchInfo["commit"].(map[string]interface{})["sha"].(string)

	contentBytes, _ := json.MarshalIndent(content, "", "\t")
	createBlobUrl := fmt.Sprintf("https://api.github.com/repos/%s/git/blobs", repoFullName)
	createBlobBodyBytes, _ := json.Marshal(map[string]interface{}{
		"content":  string(contentBytes),
		"encoding": "utf-8",
	})
	out, err, statusCode, _ = helper.HttpRequest(http.MethodPost, createBlobUrl, bytes.NewBuffer(createBlobBodyBytes), headers, 0, true)
	logrus.Trace("url:", createBlobUrl)
	logrus.Info("statusCode here:", statusCode)
	if err != nil || (statusCode != http.StatusOK && statusCode != http.StatusCreated) {
		logrus.Info(string(out))
		if err == nil {
			err = errors.New("request to Github api wasn't successful")
		}
		logrus.Error(err.Error())
		return err
	}
	blobInfo := make(map[string]interface{})
	err = json.Unmarshal(out, &blobInfo)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	blobSHA := blobInfo["sha"].(string)

	createTreeUrl := fmt.Sprintf("https://api.github.com/repos/%s/git/trees", repoFullName)
	createTreeBodyBytes, _ := json.Marshal(map[string]interface{}{
		"base_tree": lastCommitSHA,
		"tree": []map[string]interface{}{
			{
				"path": "dotenx/project.json",
				"mode": "100644",
				"type": "blob",
				"sha":  blobSHA,
			},
		},
	})
	out, err, statusCode, _ = helper.HttpRequest(http.MethodPost, createTreeUrl, bytes.NewBuffer(createTreeBodyBytes), headers, 0, true)
	logrus.Trace("url:", createTreeUrl)
	logrus.Info("statusCode here:", statusCode)
	if err != nil || (statusCode != http.StatusOK && statusCode != http.StatusCreated) {
		logrus.Info(string(out))
		if err == nil {
			err = errors.New("request to Github api wasn't successful")
		}
		logrus.Error(err.Error())
		return err
	}
	treeInfo := make(map[string]interface{})
	err = json.Unmarshal(out, &treeInfo)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	treeSHA := treeInfo["sha"].(string)

	gitAccountEmailUrl := "https://api.github.com/user/emails"
	out, err, statusCode, _ = helper.HttpRequest(http.MethodGet, gitAccountEmailUrl, nil, headers, 0, true)
	logrus.Trace("url:", gitAccountEmailUrl)
	logrus.Info("statusCode here:", statusCode)
	if err != nil || (statusCode != http.StatusOK && statusCode != http.StatusCreated) {
		logrus.Info(string(out))
		if err == nil {
			err = errors.New("request to Github api wasn't successful")
		}
		logrus.Error(err.Error())
		return err
	}
	var mailList = make([]struct {
		Email    string `json:"email"`
		Primary  bool   `json:"primary"`
		Verified bool   `json:"verified"`
	}, 0)
	err = json.Unmarshal(out, &mailList)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	primaryEmail := ""
	for _, v := range mailList {
		if v.Primary && v.Verified {
			primaryEmail = v.Email
			break
		}
	}

	createCommitUrl := fmt.Sprintf("https://api.github.com/repos/%s/git/commits", repoFullName)
	createCommitBodyBytes, _ := json.Marshal(map[string]interface{}{
		"message": commitMessage,
		"author": map[string]interface{}{
			"name":  gitUsername,
			"email": primaryEmail,
		},
		"parents": []string{
			lastCommitSHA,
		},
		"tree": treeSHA,
	})
	out, err, statusCode, _ = helper.HttpRequest(http.MethodPost, createCommitUrl, bytes.NewBuffer(createCommitBodyBytes), headers, 0, true)
	logrus.Trace("url:", createCommitUrl)
	logrus.Info("statusCode here:", statusCode)
	if err != nil || (statusCode != http.StatusOK && statusCode != http.StatusCreated) {
		logrus.Info(string(out))
		if err == nil {
			err = errors.New("request to Github api wasn't successful")
		}
		logrus.Error(err.Error())
		return err
	}
	commitInfo := make(map[string]interface{})
	err = json.Unmarshal(out, &commitInfo)
	if err != nil {
		logrus.Error(err.Error())
		return err
	}
	commitSHA := commitInfo["sha"].(string)

	updateBranchUrl := fmt.Sprintf("https://api.github.com/repos/%s/git/refs/heads/%s", repoFullName, branchName)
	updateBranchBodyBytes, _ := json.Marshal(map[string]interface{}{
		"sha":   commitSHA,
		"force": true,
	})
	out, err, statusCode, _ = helper.HttpRequest(http.MethodPatch, updateBranchUrl, bytes.NewBuffer(updateBranchBodyBytes), headers, 0, true)
	logrus.Trace("url:", updateBranchUrl)
	logrus.Info("statusCode here:", statusCode)
	if err != nil || (statusCode != http.StatusOK && statusCode != http.StatusCreated) {
		logrus.Info(string(out))
		if err == nil {
			err = errors.New("request to Github api wasn't successful")
		}
		logrus.Error(err.Error())
		return err
	}
	return nil
}
