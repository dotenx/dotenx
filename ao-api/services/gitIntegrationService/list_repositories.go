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
	MaxProjectLength int = 150
)

type repository struct {
	FullName      string `json:"full_name"`
	RepositoryUrl string `json:"clone_url"`
}

func (service *gitIntegrationService) ListRepositories(accountId, gitAccountId, provider string) ([]repository, error) {
	var secrets map[string]interface{}
	integration, err := service.GetIntegration(accountId, gitAccountId, provider)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(integration.Secrets, &secrets)
	if err != nil {
		return nil, err
	}

	repositories := make([]repository, 0, MaxProjectLength)
	switch provider {
	case "github":
		// SEE: https://docs.github.com/en/rest/reference/repos#list-repositories-for-the-authenticated-user
		itemsPerPage := 100
		repositoriesUrl := fmt.Sprintf("https://api.github.com/user/repos?type=owner&per_page=%d", itemsPerPage)
		for {
			repositoriesHeaders := []utils.Header{
				{
					Key:   "Authorization",
					Value: fmt.Sprintf("Bearer %s", secrets["access_token"]),
				},
			}
			helper := utils.NewHttpHelper(utils.NewHttpClient())
			out, err, statusCode, header := helper.HttpRequest(http.MethodGet, repositoriesUrl, nil, repositoriesHeaders, 0, true)
			fmt.Println("statusCode here", statusCode)
			if err != nil || statusCode != http.StatusOK {
				if err == nil {
					err = errors.New("request to Github api wasn't successful")
				}
				logrus.Error(err.Error())
				return nil, err
			}
			var newBatch []repository
			err = json.Unmarshal(out, &newBatch)
			if err != nil {
				logrus.Error(err.Error())
				return nil, err
			}

			limit := MaxProjectLength - len(repositories)
			repositories = append(repositories, newBatch[:MinInt(limit, len(newBatch))]...)
			limit = MaxProjectLength - len(repositories)
			if limit == 0 || len(newBatch) < itemsPerPage { // If you've reached the limit or the items returned is less than what it could be (a sign it's finished) stop iterating
				break
			}
			linkHeader := header.Get("link")
			sentinel := "; rel=\"next\""
			if linkHeader == "" || !strings.Contains(linkHeader, sentinel) { // To address the edge cases like last batch is exactly has exactly same length as itemsPerPage, check if there is a next batch link in the header
				break
			}
			repositoriesUrl = strings.TrimSuffix(strings.TrimPrefix(strings.Split(linkHeader, sentinel)[0], "<"), ">")
		}
		return repositories, nil
	default:
		return nil, errors.New("provider should be one of these values: ['github', 'gitlab', 'bitbucket']")
	}
}

func MinInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}
