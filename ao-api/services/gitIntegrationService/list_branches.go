package gitIntegrationService

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

const (
	MaxBranchLength int = 150
)

type branch struct {
	Name   string      `json:"name"`
	Commit interface{} `json:"commit"`
}

func (service *gitIntegrationService) ListBranches(accountId, gitAccountId, provider, repoFullName string) ([]branch, error) {
	var secrets map[string]interface{}
	integration, err := service.GetIntegration(accountId, gitAccountId, provider)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(integration.Secrets, &secrets)
	if err != nil {
		return nil, err
	}

	branches := make([]branch, 0, MaxBranchLength)
	switch provider {
	case "github":
		// SEE: https://docs.github.com/en/rest/reference/branches#list-branches
		itemsPerPage := 100
		branchesUrl := fmt.Sprintf("https://api.github.com/repos/%s/branches?per_page=%d", repoFullName, itemsPerPage)
		for {
			branchesHeaders := []utils.Header{
				{
					Key:   "Authorization",
					Value: fmt.Sprintf("Bearer %s", secrets["access_token"]),
				},
			}
			helper := utils.NewHttpHelper(utils.NewHttpClient())
			out, err, statusCode, header := helper.HttpRequest(http.MethodGet, branchesUrl, nil, branchesHeaders, 0, true)
			fmt.Println("url:", branchesUrl)
			fmt.Println("statusCode here", statusCode)
			if err != nil || statusCode != http.StatusOK {
				if err == nil {
					err = errors.New("request to Github api wasn't successful")
				}
				logrus.Error(err.Error())
				return nil, err
			}
			var newBatch []branch
			err = json.Unmarshal(out, &newBatch)
			if err != nil {
				logrus.Error(err.Error())
				return nil, err
			}

			limit := MaxBranchLength - len(branches)
			branches = append(branches, newBatch[:MinInt(limit, len(newBatch))]...)
			limit = MaxBranchLength - len(branches)
			if limit == 0 || len(newBatch) < itemsPerPage { // If you've reached the limit or the items returned is less than what it could be (a sign it's finished) stop iterating
				break
			}
			linkHeader := header.Get("link")
			sentinel := "; rel=\"next\""
			if linkHeader == "" || !strings.Contains(linkHeader, sentinel) { // To address the edge cases like last batch is exactly has exactly same length as itemsPerPage, check if there is a next batch link in the header
				break
			}
			branchesUrl = strings.TrimSuffix(strings.TrimPrefix(strings.Split(linkHeader, sentinel)[0], "<"), ">")
		}
		return branches, nil
	default:
		return nil, errors.New("provider should be one of these values: ['github', 'gitlab', 'bitbucket']")
	}
}
