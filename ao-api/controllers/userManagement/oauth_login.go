package userManagement

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (umc *UserManagementController) OAuthLogin() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		code := ctx.Query("code")
		projectTag := ctx.Param("project")
		providerName := ctx.Param("provider")

		project, err := umc.ProjectService.GetProjectByTag(projectTag)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}
		provider, err := umc.OauthService.GetUserProviderByName(project.AccountId, providerName)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
			return
		}

		var jwtToken string
		if provider.Type == "twitter" {
			redirectUrl := config.Configs.Endpoints.AoApiLocal + fmt.Sprintf("/user/management/project/%s/provider/%s/callback", projectTag, providerName)
			accessToken, err := getTwitterAccessToken(provider.Key, provider.Secret, code, redirectUrl, config.Configs.Secrets.CodeChallenge)
			if err != nil {
				ctx.Redirect(http.StatusTemporaryRedirect, provider.FrontEndUrl+"?error="+err.Error())
				return
			}
			user, err := getTwitterProfile(accessToken)
			if err != nil {
				ctx.Redirect(http.StatusTemporaryRedirect, provider.FrontEndUrl+"?error="+err.Error())
				return
			}
			//user.Role = "user"
			err = umc.Service.SetUserInfo(user, projectTag)
			if err != nil && err.Error() != "user already registered" {
				ctx.Redirect(http.StatusTemporaryRedirect, provider.FrontEndUrl+"?error="+err.Error())
				return
			}
			jwtToken, err = utils.GenerateTpJwtToken(project.AccountId, user.AccountId)
			if err != nil {
				ctx.Redirect(http.StatusTemporaryRedirect, provider.FrontEndUrl+"?error="+err.Error())
				return
			}
		}

		ctx.Redirect(http.StatusTemporaryRedirect, provider.FrontEndUrl+"?token="+jwtToken)
		return
	}
}

func getTwitterAccessToken(clientId, clientSecret, code, redirectUrl, codeVerifier string) (string, error) {
	var dto struct {
		AccessToekn string `json:"access_token"`
	}
	data := "client_id=" + clientId
	data += "&code=" + code
	data += "&code_verifier=" + codeVerifier
	data += "&redirect_uri=" + redirectUrl
	data += "&grant_type=authorization_code"
	url := "https://api.twitter.com/2/oauth2/token"
	headers := []utils.Header{
		{
			Key:   "Content-Type",
			Value: "application/x-www-form-urlencoded",
		},
	}
	body := bytes.NewBuffer([]byte(data))
	helper := utils.NewHttpHelper(utils.NewHttpClient())
	out, err, status, _ := helper.HttpRequest(http.MethodPost, url, body, headers, time.Minute, true)
	log.Println("twitter response:", string(out))
	log.Println("-----------------------------------------------------------")
	if err != nil {
		return "", err
	}
	if status != 200 {
		return "", errors.New("not ok with status ")
	}
	err = json.Unmarshal(out, &dto)
	return dto.AccessToekn, err
}

func getTwitterProfile(accessToken string) (userInfo models.ThirdUser, err error) {
	url := "https://api.twitter.com/2/users/me"
	headers := []utils.Header{
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", accessToken),
		},
	}
	helper := utils.NewHttpHelper(utils.NewHttpClient())
	out, err, status, _ := helper.HttpRequest(http.MethodGet, url, nil, headers, time.Minute, true)
	log.Println("twitter response:", string(out))
	if err != nil {
		return
	}
	if status != http.StatusOK {
		err = errors.New("can't get correct response from twitter")
		return
	}

	type info struct {
		AccountId string `json:"id"`
		Name      string `json:"name"`
	}
	type profile struct {
		Data info `json:"data"`
	}
	var prof profile
	err = json.Unmarshal(out, &prof)
	if err != nil {
		return
	}

	userInfo = models.ThirdUser{
		AccountId: "twitter-" + prof.Data.AccountId,
		FullName:  prof.Data.Name,
	}
	return
}
