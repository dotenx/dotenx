package config

import "github.com/kelseyhightower/envconfig"

type (
	Config struct {
		App       App
		Database  Database
		Secrets   Secrets
		Endpoints Endpoints
		Queue     Queue
	}

	App struct {
		Port           string `envconfig:"AOA_APP_PORT" default:"3004"`
		CheckTrigger   string `envconfig:"AOA_APP_CHECK_TRIGGER"`
		AccountId      string `envconfig:"AOA_APP_ACCOUNT_ID"`
		Environment    string `envconfig:"AOA_APP_ENV"`
		AllowedOrigins string `envconfig:"AOA_APP_ALLOWED_ORIGINS" default:"*"`
	}

	Queue struct {
		BULL string `envconfig:"AOA_BULL_URL"`
	}
	Endpoints struct {
		AoApi string `envconfig:"AOA_AO_API_URL"`
		Core  string `envconfig:"AOA_CORE_API_URL"`
	}

	Database struct {
		Host     string `envconfig:"AOA_DATABASE_HOST"`
		Port     int    `envconfig:"AOA_DATABASE_PORT"`
		User     string `envconfig:"AOA_DATABASE_USER"`
		Password string `envconfig:"AOA_DATABASE_PASSWORD"`
		DbName   string `envconfig:"AOA_DATABASE_DBNAME"`
		Extras   string `envconfig:"AOA_DATABASE_EXTRAS"`
		Driver   string `envconfig:"AOA_DATABASE_DRIVER" default:"postgres"`
	}
	Secrets struct {
		AuthServerJwtSecret string `envconfig:"AOA_AUTH_SERVER_JWT_SECRET"`
		AppName             string `envconfig:"AOA_APP_NAME"`
		AppSecret           string `envconfig:"AOA_APP_SECRET"`
	}
)

var Configs Config

func Load() error {
	err := envconfig.Process("", &Configs)
	return err
}
