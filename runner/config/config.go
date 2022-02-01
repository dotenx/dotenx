package config

import "github.com/kelseyhightower/envconfig"

type (
	Config struct {
		Secrets   Secrets
		Queue     Queue
		Endpoints Endpoints
	}
	Queue struct {
		URL             string `envconfig:"AOR_AMQP_URL"`
		Name            string `envconfig:"AOR_QUEUE_NAME"`
		Exchange        string `envconfig:"AOR_QUEUE_EXCHANGE"`
		Key             string `envconfig:"AOR_QUEUE_KEY"`
		WorkersExchange string `envconfig:"AOR_QUEUE_WORKERS_EXCHANGE"`
		WorkersKey      string `envconfig:"AOR_QUEUE_WORKERS_KEY"`
	}

	Endpoints struct {
		Core             string `envconfig:"AOR_CORE_API_URL"`
		AoAPI            string `envconfig:"AOR_AO_API_URL"`
		SecretManager    string `envconfig:"AOR_AO_SM_URL"`
		AoBridge         string `envconfig:"AOR_BRIDGE_URL"`
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
