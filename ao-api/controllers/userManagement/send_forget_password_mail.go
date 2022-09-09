package userManagement

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

/*
	SendForgetPasswordMail sends an email (with SendGrid) to third party user, this email has
	a sucurity code for reset (change) password and tp user finally redirected to ui page (app.dotenx.com)
	for enter new password and change it
*/
func (umc *UserManagementController) SendForgetPasswordMail(httpHelper utils.HttpHelper) gin.HandlerFunc {
	return func(ctx *gin.Context) {

		var body loginInfo
		projectTag := ctx.Param("tag")
		if ctx.ShouldBindJSON(&body) != nil || body.Email == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"message": "email field in body is empty",
			})
			return
		}
		// get user information from database
		user, err := umc.Service.GetUserInfo(body.Email, projectTag)
		if err != nil {
			if err.Error() == "user not found" {
				ctx.JSON(http.StatusNotFound, gin.H{
					"message": "email is incorrect",
				})
				return
			}
			logrus.Error(err.Error())
			ctx.Status(http.StatusInternalServerError)
			return
		}

		securityCode := utils.RandStringRunes(32, utils.FullRunes)
		forgetPass := models.SecurityCode{
			Email:          body.Email,
			SecurityCode:   securityCode,
			ExpirationTime: int(time.Now().Add(15 * time.Minute).Unix()),
			Usable:         true,
			UseCase:        utils.ForgetPasswordUseCase,
		}
		err = umc.Service.SetSecurityCodeInfo(forgetPass, projectTag)
		if err != nil {
			logrus.Error(err.Error())
			ctx.Status(http.StatusInternalServerError)
			return
		}

		// SEE: https://docs.sendgrid.com/api-reference/mail-send/mail-send
		sendMailUrl := fmt.Sprintf("%s/v3/mail/send", config.Configs.Endpoints.SendGrid)
		sendMailBody := make(map[string]interface{})
		personalizations := make([]map[string]interface{}, 0)
		personalizations = append(personalizations, map[string]interface{}{
			"subject": "Forgot your password?",
			"to": []map[string]string{
				{
					"email": body.Email,
					"name":  user.FullName,
				},
			},
		})
		sendMailBody["personalizations"] = personalizations
		sendMailBody["from"] = map[string]interface{}{
			"email": config.Configs.Endpoints.SystemSender,
			"name":  "DoTenX",
		}
		sendMailBody["content"] = []map[string]string{
			{
				"type":  "text/plain",
				"value": fmt.Sprintf("This is an email from DoTenX (no code provider)\nPlease click on link to reset your password:\n%s/project/%s/reset-password?token=%s", config.Configs.Endpoints.UILocal, projectTag, forgetPass.SecurityCode),
			},
		}
		sendMailHeaders := []utils.Header{
			{
				Key:   "Content-Type",
				Value: "application/json",
			},
			{
				Key:   "Authorization",
				Value: fmt.Sprintf("Bearer %s", config.Configs.Secrets.SendGridToken),
			},
		}
		jsonData, err := json.Marshal(sendMailBody)
		if err != nil {
			logrus.Error(err.Error())
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}
		logrus.Info("body of send mail request:", string(jsonData))
		out, err, statusCode, _ := httpHelper.HttpRequest(http.MethodPost, sendMailUrl, bytes.NewBuffer(jsonData), sendMailHeaders, 0, false)
		if err != nil || statusCode != http.StatusAccepted {
			logrus.Info("SendGrid response (send email request):", string(out))
			if statusCode != http.StatusAccepted {
				err = errors.New(fmt.Sprint("can't get correct response from SendGrid. Status code: ", statusCode))
			}
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"message": err.Error(),
			})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"message": "Sending email was successfull",
		})
	}
}
