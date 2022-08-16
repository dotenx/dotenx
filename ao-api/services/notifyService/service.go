package notifyService

import (
	"github.com/dotenx/dotenx/ao-api/config"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

type NotifierService interface {
	SendWelcomeEmail(username string, userEmail string) error
}

type NotifierServiceImpl struct {
}

func NewNotifierService() NotifierService {
	return &NotifierServiceImpl{}
}

func (ns *NotifierServiceImpl) SendWelcomeEmail(username string, userEmail string) error {
	email := mail.NewV3Mail()
	from := mail.NewEmail("dotenx", "support@dotenx.com")
	email.From = from
	to := mail.NewEmail("for User", userEmail)
	pers := mail.NewPersonalization()
	pers.To = make([]*mail.Email, 0)
	pers.To = append(pers.To, to)
	pers.Subject = "welcome to dotenx"
	pers.From = from
	pers.DynamicTemplateData = map[string]interface{}{
		"name": username,
	}
	email.Personalizations = make([]*mail.Personalization, 0)
	email.Personalizations = append(email.Personalizations, pers)
	email.TemplateID = "d-ac1f50c55ecc4c4eaa8a63deb3b81f30"
	email.Subject = "welcome to dotenx"
	client := sendgrid.NewSendClient(config.Configs.Secrets.SendGridToken)
	_, err := client.Send(email)
	return err
}
