package config

import "github.com/kelseyhightower/envconfig"

type (
	Config struct {
		Secrets   Secrets
		Queue     Queue
		Endpoints Endpoints
	}
	Queue struct {
		Token string `envconfig:"AOR_QUEUE_TOKEN"`
		Name  string `envconfig:"AOR_QUEUE_NAME"`
	}
	Endpoints struct {
		Core             string `envconfig:"AOR_CORE_API_URL"`
		AoAPI            string `envconfig:"AOR_AO_API_URL"`
		SecretManager    string `envconfig:"AOR_AO_SM_URL"`
		JobScheduler     string `envconfig:"AOR_JOBSCHEDULER_URL"`
		LogstreamManager string `envconfig:"AOR_LSM_URL"`
	}

	Secrets struct {
		AuthServerJwtSecret string `envconfig:"AOR_AUTH_SERVER_JWT_SECRET"`
		AppName             string `envconfig:"AOR_APP_NAME"`
		AppSecret           string `envconfig:"AOR_APP_SECRET"`
	}
)

var Configs Config

func Load() error {
	err := envconfig.Process("", &Configs)
	return err
}
